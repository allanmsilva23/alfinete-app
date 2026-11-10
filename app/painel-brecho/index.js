import React, { useCallback, useState } from 'react';
import {
  Alert, ScrollView, View, Text, Image, ActivityIndicator,
  TextInput, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { api, safeImageUrl } from '../../src/api/client';
import { useAuth } from '../../src/auth/AuthContext';
import { Action, Card, Title, Field, Pill, s, palette } from '../../components/AlfineteUI';

// "Faixa de preço" deixa de ser digitada livremente: será gerada no backend.
const editable = [
  ['nome', 'Nome do brechó'],
  ['descricao', 'Descrição'],
  ['endereco_curto', 'Bairro e cidade'],
  ['horario_funcionamento', 'Horário de funcionamento'],
  ['regras_avaliacao', 'Regras para avaliação de roupas'],
  ['telefone', 'WhatsApp com DDD'],
  ['link_instagram', 'Instagram'],
  ['logradouro', 'Rua'], ['numero', 'Número'], ['bairro', 'Bairro'],
  ['cidade', 'Cidade'], ['estado', 'UF'], ['cep', 'CEP'],
];

const sugestoes = [
  'Feminino', 'Masculino', 'Clássica', 'Vintage', 'Y2K',
  'Streetwear', 'Casual', 'Básica', 'Elegante', 'Acessórios',
];

const chave = valor => String(valor ?? '').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();

function numeroBR(texto) {
  const valor = String(texto ?? '').trim();
  if (!/^\d{1,8}([.,]\d{1,2})?$/.test(valor)) return null;
  const numero = Number(valor.replace(',', '.'));
  return Number.isFinite(numero) && numero >= 0 && numero <= 99999999.99 ? numero : null;
}

function formatarValor(valor) {
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
}

function CampoPreco({ label, value, onChangeText }) {
  return (
    <View style={{ flex: 1, minWidth: 135, marginBottom: 12 }}>
      <Text style={s.label}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: palette.brown, marginRight: 6, fontWeight: '600' }}>R$</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder="Ex.: 30,00"
          placeholderTextColor={palette.soft}
          style={[s.input, { flex: 1, minWidth: 0 }]}
          maxLength={11}
        />
      </View>
    </View>
  );
}

export default function PainelBrecho() {
  const router = useRouter();
  const { user, ready, logout, refreshUser } = useAuth();
  const [page, setPage] = useState('dados');
  const [brecho, setBrecho] = useState(null);
  const [form, setForm] = useState({});
  const [estilos, setEstilos] = useState([]);
  const [novoEstilo, setNovoEstilo] = useState('');
  const [precoMinimo, setPrecoMinimo] = useState('');
  const [precoMaximo, setPrecoMaximo] = useState('');
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState({});
  const [reasons, setReasons] = useState({});
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [b, r, a] = await Promise.all([
        api('/painel-brecho/me'),
        api('/painel-brecho/solicitacoes'),
        api('/painel-brecho/avaliacoes'),
      ]);
      setBrecho(b);
      setForm(Object.fromEntries(editable.map(([key]) => [key, String(b[key] ?? '')])));
      setEstilos(Array.isArray(b.estilos) ? b.estilos : []);
      setNovoEstilo('');
      setPrecoMinimo(b.preco_minimo == null ? '' : String(b.preco_minimo).replace('.', ','));
      setPrecoMaximo(b.preco_maximo == null ? '' : String(b.preco_maximo).replace('.', ','));
      setRequests(Array.isArray(r) ? r : []);
      setReviews(a.avaliacoes || []);
      setRating({ media: a.nota_media, total: a.total });
    } catch (e) {
      Alert.alert('Erro no painel', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    if (!ready) return;
    if (!user) { router.replace('/'); return; }
    if (user.tipo_conta !== 'brecho') { router.replace('/profile'); return; }
    load();
  }, [ready, user?.id, user?.tipo_conta, load, router]));

  const exec = async (path, method, body, message) => {
    try {
      setLoading(true);
      await api(path, { method, body });
      if (message) Alert.alert('Alfinete', message);
      await load();
      await refreshUser();
    } catch (e) {
      Alert.alert('Não foi possível salvar', e.message);
    } finally {
      setLoading(false);
    }
  };

  const adicionarEstilo = valor => {
    const texto = String(valor ?? '').normalize('NFC').trim().replace(/\s+/g, ' ');
    if (texto.length < 2 || texto.length > 40) {
      Alert.alert('Estilo inválido', 'Informe um estilo entre 2 e 40 caracteres.');
      return;
    }
    if (!/^[\p{L}\p{N}\s&'./+\-]+$/u.test(texto)) {
      Alert.alert('Estilo inválido', 'Use apenas letras, números e pontuação simples.');
      return;
    }
    if (!estilos.some(item => chave(item) === chave(texto))) {
      if (estilos.length >= 12) {
        Alert.alert('Limite de estilos', 'Você pode cadastrar até 12 estilos por brechó.');
        return;
      }
      setEstilos(anteriores => [...anteriores, texto]);
    }
    setNovoEstilo('');
  };

  const salvarDados = () => {
    const minPreenchido = precoMinimo.trim().length > 0;
    const maxPreenchido = precoMaximo.trim().length > 0;
    if (minPreenchido !== maxPreenchido) {
      return Alert.alert('Faixa incompleta', 'Preencha os dois preços ou deixe ambos vazios.');
    }
    const minimo = minPreenchido ? numeroBR(precoMinimo) : null;
    const maximo = maxPreenchido ? numeroBR(precoMaximo) : null;
    if (minPreenchido && (minimo === null || maximo === null)) {
      return Alert.alert('Preço inválido', 'Use números como 30 ou 30,50, sem digitar R$.');
    }
    if (minimo !== null && minimo > maximo) {
      return Alert.alert('Faixa inválida', 'O preço mínimo não pode superar o máximo.');
    }
    if (novoEstilo.trim()) {
      return Alert.alert('Estilo não adicionado', 'Toque em "Adicionar estilo" antes de salvar.');
    }
    // A padronização definitiva de capitalização ocorre novamente no backend.
    exec('/painel-brecho/me', 'PATCH', {
      ...form,
      estilos,
      preco_minimo: minimo,
      preco_maximo: maximo,
    }, 'Brechó atualizado.');
  };

  const addPhotos = async () => {
    try {
      const remaining = 5 - (brecho?.fotos?.length || 0);
      if (remaining < 1) return Alert.alert('Limite atingido', 'Remova uma foto para adicionar outra.');
      const selection = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsMultipleSelection: true,
        selectionLimit: remaining, quality: 0.75,
      });
      if (selection.canceled || !selection.assets?.length) return;
      const fd = new FormData();
      for (const a of selection.assets) fd.append('fotos', new File(a.uri));
      await exec('/painel-brecho/fotos', 'POST', fd, 'Fotos publicadas!');
    } catch (e) {
      Alert.alert('Erro nas fotos', e.message);
    }
  };

  const updateRequest = (id, status) => {
    const current = requests.find(r => String(r.id) === String(id));
    if (current?.status?.toUpperCase() === status) {
      return Alert.alert('Alfinete', 'A peça já está com esse status.');
    }
    const reason = String(reasons[id] ?? current?.motivo_recusa ?? '').trim();
    if (status === 'RECUSADO' && reason.length < 3) {
      return Alert.alert('Motivo obrigatório', 'Explique por que a peça foi recusada (mínimo de 3 caracteres).');
    }
    exec(`/painel-brecho/solicitacoes/${id}/status`, 'PATCH', {
      status, motivo_recusa: status === 'RECUSADO' ? reason : '',
    }, status === 'APROVADO' ? 'Peça aprovada com sucesso.' : 'Peça recusada com sucesso.');
  };

  const deleteAccount = () => Alert.alert(
    'Excluir minha conta',
    'Seu brechó deixará de aparecer no feed e seu login será desativado. Esta ação não pode ser desfeita pelo aplicativo.',
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir conta', style: 'destructive', onPress: async () => {
        try {
          await api('/painel-brecho/me', { method: 'DELETE' });
          await logout(); router.replace('/');
        } catch (e) { Alert.alert('Erro', e.message); }
      } },
    ],
  );

  if (!ready || !user || user.tipo_conta !== 'brecho') {
    return <View style={s.page}><ActivityIndicator style={{ marginTop: 80 }} color={palette.primary} /></View>;
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={s.page}>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <Title subtitle="Gerencie as fotos, os pedidos e os comentários da sua loja.">Meu brechó</Title>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Pill active={page === 'dados'} onPress={() => setPage('dados')}>Dados e fotos</Pill>
          <Pill active={page === 'pecas'} onPress={() => setPage('pecas')}>Peças ({requests.length})</Pill>
          <Pill active={page === 'reviews'} onPress={() => setPage('reviews')}>Avaliações ({reviews.length})</Pill>
        </View>
        <Action secondary small title="Atualizar informações" onPress={load} disabled={loading} />
        {loading && <ActivityIndicator color={palette.primary} style={{ marginVertical: 12 }} />}

        {page === 'dados' && <>
          <Card>
            <Text style={{ fontSize: 16, color: palette.brown, fontWeight: '700', marginBottom: 10 }}>Informações do brechó</Text>
            {editable.map(([key, label]) => (
              <Field key={key} label={label} value={form[key]}
                multiline={['descricao', 'regras_avaliacao'].includes(key)}
                onChangeText={v => setForm(old => ({ ...old, [key]: v }))} />
            ))}

            <Text style={[s.label, { fontSize: 15, marginTop: 10 }]}>Estilos do brechó</Text>
            <Text style={[s.muted, { marginBottom: 10 }]}>Selecione sugestões ou adicione seus próprios estilos.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {sugestoes.map(item => {
                const selecionado = estilos.some(valor => chave(valor) === chave(item));
                return <TouchableOpacity key={item} disabled={loading}
                  onPress={() => selecionado
                    ? setEstilos(old => old.filter(x => chave(x) !== chave(item)))
                    : adicionarEstilo(item)}
                  style={{ borderRadius: 20, borderWidth: 1,
                    backgroundColor: selecionado ? '#F4E4DA' : '#FFFFFF',
                    borderColor: selecionado ? palette.primary : palette.line,
                    paddingHorizontal: 12, paddingVertical: 9 }}>
                  <Text style={{ fontSize: 12, color: palette.brown, fontWeight: selecionado ? '700' : '400' }}>
                    {selecionado ? '✓ ' : '+ '}{item}
                  </Text>
                </TouchableOpacity>;
              })}
            </View>
            <Field label="Outro estilo" value={novoEstilo}
              onChangeText={setNovoEstilo} placeholder="Ex.: moda feminina" />
            <Action secondary small title="Adicionar estilo" disabled={loading || !novoEstilo.trim()}
              onPress={() => adicionarEstilo(novoEstilo)} />
            {!!estilos.length && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginVertical: 12 }}>
              {estilos.map(item => <TouchableOpacity key={chave(item)}
                disabled={loading}
                onPress={() => setEstilos(old => old.filter(x => chave(x) !== chave(item)))}
                style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 16,
                  backgroundColor: '#F6ECE5', borderWidth: 1, borderColor: palette.line }}>
                <Text style={{ color: palette.brown }}>{item}  ×</Text>
              </TouchableOpacity>)}
            </View>}
            <Text style={[s.muted, { marginBottom: 16 }]}>Toque em um estilo selecionado para removê-lo.</Text>

            <Text style={[s.label, { fontSize: 15 }]}>Preços das peças</Text>
            <Text style={[s.muted, { marginBottom: 10 }]}>Informe o menor e o maior preço praticados na loja. Não digite “R$”.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <CampoPreco label="Preço mínimo" value={precoMinimo} onChangeText={setPrecoMinimo} />
              <CampoPreco label="Preço máximo" value={precoMaximo} onChangeText={setPrecoMaximo} />
            </View>
            {numeroBR(precoMinimo) !== null && numeroBR(precoMaximo) !== null &&
              numeroBR(precoMinimo) <= numeroBR(precoMaximo) &&
              <Text style={[s.muted, { marginBottom: 12 }]}>
                Faixa exibida: {formatarValor(numeroBR(precoMinimo))} a {formatarValor(numeroBR(precoMaximo))}
              </Text>}
            <Action title="Salvar informações" disabled={loading} onPress={salvarDados} />
          </Card>

          <Card>
            <Text style={{ fontSize: 16, color: palette.brown, fontWeight: '700' }}>Fotos do brechó ({brecho?.fotos?.length || 0}/5)</Text>
            <Text style={[s.muted, { marginVertical: 8 }]}>A primeira foto será a capa do brechó no feed.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {(brecho?.fotos || []).map(f => <View key={f.id} style={{ width: '47%' }}>
                <Image source={{ uri: safeImageUrl(f.url) }} style={{ width: '100%', height: 125, borderRadius: 10, backgroundColor: palette.line }} />
                <Action danger small title="Excluir foto" disabled={loading}
                  onPress={() => Alert.alert('Remover foto', 'Excluir esta foto do brechó?', [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Excluir', style: 'destructive', onPress: () => exec(`/painel-brecho/fotos/${f.id}`, 'DELETE') },
                  ])} />
              </View>)}
            </View>
            <Action title="Adicionar fotos" disabled={loading || (brecho?.fotos?.length || 0) >= 5} onPress={addPhotos} />
          </Card>
          <Action danger title="Excluir minha conta e retirar o brechó do feed" onPress={deleteAccount} />
        </>}

        {page === 'pecas' && <>
          {!requests.length && <Card><Text style={s.muted}>Nenhuma peça enviada para avaliação ainda.</Text></Card>}
          {requests.map(r => <Card key={r.id}>
            <Text style={{ color: palette.brown, fontSize: 16, fontWeight: '700' }}>{r.categoria_peca} · {r.nome_usuario}</Text>
            <Text style={s.muted}>Marca: {r.marca || 'Não informada'} · Tamanho: {r.tamanho || '—'}</Text>
            <View style={{ alignSelf: 'flex-start', backgroundColor: r.status === 'APROVADO' ? '#E2F5EA' : r.status === 'RECUSADO' ? '#FBE8E4' : '#F7EBDD', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, marginVertical: 8 }}>
              <Text style={{ fontWeight: '700', color: r.status === 'APROVADO' ? '#26734B' : r.status === 'RECUSADO' ? '#B34332' : '#8A5A38' }}>
                {r.status === 'APROVADO' ? '✓ Aprovada' : r.status === 'RECUSADO' ? '✕ Recusada' : '◷ Pendente'}
              </Text>
            </View>
            {!!r.descricao && <Text style={s.muted}>{r.descricao}</Text>}
            <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
              {[r.foto_frente_url, r.foto_verso_url].filter(Boolean).map((url, i) =>
                <Image key={i} source={{ uri: safeImageUrl(url) }} style={{ width: 96, height: 96, borderRadius: 10 }} />)}
            </View>
            <Action secondary small title={r.status === 'APROVADO' ? 'Peça aprovada' : 'Aprovar peça'}
              disabled={loading || r.status === 'APROVADO'} onPress={() => updateRequest(r.id, 'APROVADO')} />
            <Field label="Motivo da recusa" value={reasons[r.id] ?? r.motivo_recusa ?? ''}
              onChangeText={v => setReasons(old => ({ ...old, [r.id]: v }))}
              placeholder="Ex.: a peça apresenta manchas" multiline />
            <Action danger small title={r.status === 'RECUSADO' ? 'Peça recusada' : 'Recusar peça'}
              disabled={loading || r.status === 'RECUSADO'} onPress={() => updateRequest(r.id, 'RECUSADO')} />
          </Card>)}
        </>}

        {page === 'reviews' && <>
          <Card><Text style={{ fontSize: 18, color: palette.brown, fontWeight: '700' }}>⭐ {rating.media ?? 'Sem notas'} · {rating.total || 0} avaliações</Text></Card>
          {!reviews.length && <Card><Text style={s.muted}>Ainda não há comentários sobre sua loja.</Text></Card>}
          {reviews.map(r => <Card key={r.id}>
            <Text style={{ fontSize: 15, color: palette.brown, fontWeight: '700' }}>{r.usuario_nome} · ⭐ {r.nota}/5</Text>
            <Text style={[s.muted, { marginVertical: 10 }]}>{r.comentario}</Text>
            {!!r.resposta_brecho && <Text style={s.muted}>Resposta atual: {r.resposta_brecho}</Text>}
            <Field label="Sua resposta ao comentário" multiline
              value={responses[r.id] ?? r.resposta_brecho ?? ''}
              onChangeText={v => setResponses(old => ({ ...old, [r.id]: v }))}
              placeholder="Agradeça ou esclareça a avaliação" />
            <Action title="Publicar resposta" disabled={loading}
              onPress={() => exec(`/painel-brecho/avaliacoes/${r.id}/resposta`, 'PATCH',
                { resposta: responses[r.id] ?? r.resposta_brecho ?? '' }, 'Resposta publicada.')} />
          </Card>)}
        </>}
        <Action secondary title="Meu perfil" onPress={() => router.push('/profile')} />
        <Action secondary title="Sair do Alfinete" onPress={async () => { await logout(); router.replace('/'); }} />
      </ScrollView>
    </SafeAreaView>
  );
}