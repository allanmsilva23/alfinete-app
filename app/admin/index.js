import React,{useCallback,useState} from 'react';
import {Alert,ScrollView,View,Text,ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect,useRouter} from 'expo-router';
import {api} from '../../src/api/client';
import {useAuth} from '../../src/auth/AuthContext';
import {Action,Card,Title,Field,Pill,s,palette} from '../../components/AlfineteUI';
const editable=[['nome','Nome do brechó'],['descricao','Descrição'],['endereco_curto','Bairro e cidade'],['horario_funcionamento','Horário'],['faixa_preco','Faixa de preço'],['regras_avaliacao','Regras para avaliar roupas'],['telefone','WhatsApp'],['link_instagram','Instagram'],['logradouro','Rua'],['numero','Número'],['bairro','Bairro'],['cidade','Cidade'],['estado','UF'],['cep','CEP']];
export default function AdminScreen(){
  const router=useRouter(),{user,ready,logout}=useAuth();
  const [rows,setRows]=useState([]),[busy,setBusy]=useState(false),[selected,setSelected]=useState(null),[draft,setDraft]=useState({}),[filter,setFilter]=useState('PENDENTE');
  const load=useCallback(async()=>{try{setBusy(true);setRows(await api('/admin/brechos'));}catch(e){Alert.alert('Erro no painel',e.message);}finally{setBusy(false);}},[]);
  useFocusEffect(useCallback(()=>{if(!ready)return;if(!user){router.replace('/');return;}if(user.tipo_conta!=='admin'){router.replace('/profile');return;}load();},[ready,user?.id]));
  const update=async(item,path,body,method='POST',confirmation)=>{
    const perform=async()=>{try{setBusy(true);const r=await api(path,{method,body});Alert.alert('Alfinete',r.mensagem||'Operação concluída.');setSelected(null);await load();}catch(e){Alert.alert('Não foi possível concluir',e.message);}finally{setBusy(false);}};
    if(confirmation)Alert.alert('Confirmação',confirmation,[{text:'Cancelar',style:'cancel'},{text:'Confirmar',onPress:perform}]);else await perform();
  };
  const available=rows.filter(x=>filter==='TODOS'||x.status_aprovacao===filter);
  if(!ready||!user||user.tipo_conta!=='admin')return <View style={s.page}><ActivityIndicator style={{marginTop:80}} color={palette.primary}/></View>;
  return <SafeAreaView style={s.page} edges={['top','bottom']}><ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
    <Title subtitle="Aprove novos brechós, edite informações e controle quem aparece no Alfinete.">Painel do administrador</Title>
    <View style={{flexDirection:'row',flexWrap:'wrap'}}>
      <Pill active={filter==='PENDENTE'} onPress={()=>setFilter('PENDENTE')}>Pendentes</Pill><Pill active={filter==='APROVADO'} onPress={()=>setFilter('APROVADO')}>Aprovados</Pill><Pill active={filter==='TODOS'} onPress={()=>setFilter('TODOS')}>Todos</Pill>
    </View>
    <Action secondary small title="Atualizar lista" onPress={load} disabled={busy}/>
    {busy&&<ActivityIndicator color={palette.primary} style={{margin:12}}/>}
    {!available.length&&<Card><Text style={s.muted}>Nenhum brechó nessa categoria.</Text></Card>}
    {available.map(b=><Card key={b.id}>
      <Text style={{fontWeight:'700',fontSize:17,color:palette.brown}}>{b.nome}</Text>
      <Text style={s.muted}>Situação: {b.ativo ? b.status_aprovacao : 'REMOVIDO'}</Text>
      <Text style={s.muted}>Responsável: {b.responsavel||'Sem proprietário vinculado'}{b.email?` · ${b.email}`:''}</Text>
      {b.status_aprovacao==='PENDENTE'&&<Action title="Aprovar cadastro" disabled={busy} onPress={()=>update(b,`/admin/brechos/${b.id}/aprovar`,undefined,'POST','Aprovar este brechó e enviar e-mail para o responsável?')}/>}
      {b.status_aprovacao==='APROVADO'&&b.usuario_id&&!b.aprovacao_email_enviado_em&&<Action secondary small disabled={busy} title="Reenviar e-mail de aprovação" onPress={()=>update(b,`/admin/brechos/${b.id}/reenviar-email`)}/>}
      <Action secondary title="Editar informações" onPress={()=>{setSelected(selected===b.id?null:b.id);setDraft(Object.fromEntries(editable.map(([key])=>[key,b[key]||''])));}}/>
      {selected===b.id&&<View style={{marginTop:12}}>
        {editable.map(([key,label])=><Field key={key} label={label} value={draft[key]} multiline={['descricao','regras_avaliacao'].includes(key)} onChangeText={v=>setDraft(old=>({...old,[key]:v}))}/>)}
        <Action title="Salvar alterações" disabled={busy} onPress={()=>update(b,`/admin/brechos/${b.id}`,draft,'PATCH')}/>
      </View>}
      {b.ativo===1||b.ativo===true?<Action danger small title="Remover brechó do feed" disabled={busy} onPress={()=>update(b,`/admin/brechos/${b.id}`,undefined,'DELETE','A loja será desativada e deixará de aparecer no feed. O histórico será preservado. Continuar?')}/>:null}
    </Card>)}
    <Action secondary title="Ir para meu perfil" onPress={()=>router.push('/profile')}/>
    <Action secondary title="Sair" onPress={async()=>{await logout();router.replace('/');}}/>
  </ScrollView></SafeAreaView>;
}
