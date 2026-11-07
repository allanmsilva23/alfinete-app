import React,{useCallback,useState} from 'react';
import {Alert,ScrollView,View,Text,Image,ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect,useRouter} from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {File} from 'expo-file-system';
import {api,safeImageUrl} from '../../src/api/client';
import {useAuth} from '../../src/auth/AuthContext';
import {Action,Card,Title,Field,Pill,s,palette} from '../../components/AlfineteUI';
const editable=[['nome','Nome do brechó'],['descricao','Descrição'],['endereco_curto','Bairro e cidade'],['horario_funcionamento','Horário de funcionamento'],['faixa_preco','Faixa de preço'],['regras_avaliacao','Regras para avaliação de roupas'],['telefone','WhatsApp com DDD'],['link_instagram','Instagram'],['logradouro','Rua'],['numero','Número'],['bairro','Bairro'],['cidade','Cidade'],['estado','UF'],['cep','CEP']];
export default function PainelBrecho(){
  const router=useRouter(),{user,ready,logout,refreshUser}=useAuth();
  const [page,setPage]=useState('dados'),[brecho,setBrecho]=useState(null),[form,setForm]=useState({}),[requests,setRequests]=useState([]),[reviews,setReviews]=useState([]),[rating,setRating]=useState({}),[reasons,setReasons]=useState({}),[responses,setResponses]=useState({}),[loading,setLoading]=useState(false);
  const load=useCallback(async()=>{try{setLoading(true);
    const [b,r,a]=await Promise.all([api('/painel-brecho/me'),api('/painel-brecho/solicitacoes'),api('/painel-brecho/avaliacoes')]);
    setBrecho(b);setForm(Object.fromEntries(editable.map(([key])=>[key,b[key]||''])));setRequests(r);setReviews(a.avaliacoes||[]);setRating({media:a.nota_media,total:a.total});
  }catch(e){Alert.alert('Erro no painel',e.message);}finally{setLoading(false);}},[]);
  useFocusEffect(useCallback(()=>{if(!ready)return;if(!user){router.replace('/');return;}if(user.tipo_conta!=='brecho'){router.replace('/profile');return;}load();},[ready,user?.id]));
  const exec=async(path,method,body,message)=>{try{setLoading(true);await api(path,{method,body});if(message)Alert.alert('Alfinete',message);await load();await refreshUser();}catch(e){Alert.alert('Não foi possível salvar',e.message);}finally{setLoading(false);}};
  const addPhotos=async()=>{try{
    const remaining=5-(brecho?.fotos?.length||0);if(remaining<1)return Alert.alert('Limite atingido','Remova uma foto para adicionar outra.');
    const selection=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsMultipleSelection:true,selectionLimit:remaining,quality:0.75});
    if(selection.canceled||!selection.assets?.length)return;
    const fd=new FormData();for(const a of selection.assets)fd.append('fotos',new File(a.uri));
    await exec('/painel-brecho/fotos','POST',fd,'Fotos publicadas!');
  }catch(e){Alert.alert('Erro nas fotos',e.message);}};
  const updateRequest=(id,status)=>{
    const current=requests.find(r=>String(r.id)===String(id));
    if(current?.status?.toUpperCase()===status)return Alert.alert('Alfinete','A peça já está com esse status.');
    const reason=String(reasons[id]??current?.motivo_recusa??'').trim();
    if(status==='RECUSADO' && reason.length<3)return Alert.alert('Motivo obrigatório','Explique por que a peça foi recusada (mínimo de 3 caracteres).');
    exec(`/painel-brecho/solicitacoes/${id}/status`,'PATCH',{status,motivo_recusa:status==='RECUSADO'?reason:''},status==='APROVADO'?'Peça aprovada com sucesso.':'Peça recusada com sucesso.');
  };
  const deleteAccount=()=>Alert.alert('Excluir minha conta','Seu brechó deixará de aparecer no feed e seu login será desativado. Esta ação não pode ser desfeita pelo aplicativo.',[
    {text:'Cancelar',style:'cancel'},{text:'Excluir conta',style:'destructive',onPress:async()=>{try{await api('/painel-brecho/me',{method:'DELETE'});await logout();router.replace('/');}catch(e){Alert.alert('Erro',e.message);}}}
  ]);
  if(!ready||!user||user.tipo_conta!=='brecho')return <View style={s.page}><ActivityIndicator style={{marginTop:80}} color={palette.primary}/></View>;
  return <SafeAreaView edges={['top','bottom']} style={s.page}><ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
    <Title subtitle="Gerencie as fotos, os pedidos e os comentários da sua loja.">Meu brechó</Title>
    <View style={{flexDirection:'row',flexWrap:'wrap'}}>
      <Pill active={page==='dados'} onPress={()=>setPage('dados')}>Dados e fotos</Pill>
      <Pill active={page==='pecas'} onPress={()=>setPage('pecas')}>Peças ({requests.length})</Pill>
      <Pill active={page==='reviews'} onPress={()=>setPage('reviews')}>Avaliações ({reviews.length})</Pill>
    </View>
    <Action secondary small title="Atualizar informações" onPress={load} disabled={loading}/>
    {loading&&<ActivityIndicator color={palette.primary} style={{marginVertical:12}}/>}
    {page==='dados'&&<>
      <Card><Text style={{fontSize:16,color:palette.brown,fontWeight:'700',marginBottom:10}}>Informações do brechó</Text>
        {editable.map(([key,label])=><Field key={key} label={label} value={form[key]} multiline={['descricao','regras_avaliacao'].includes(key)} onChangeText={v=>setForm(o=>({...o,[key]:v}))}/>)}
        <Action title="Salvar informações" disabled={loading} onPress={()=>exec('/painel-brecho/me','PATCH',form,'Brechó atualizado.')}/>
      </Card>
      <Card><Text style={{fontSize:16,color:palette.brown,fontWeight:'700'}}>Fotos do brechó ({brecho?.fotos?.length||0}/5)</Text>
        <Text style={[s.muted,{marginVertical:8}]}>A primeira foto será a capa do brechó no feed.</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>{(brecho?.fotos||[]).map(f=><View key={f.id} style={{width:'47%'}}>
          <Image source={{uri:safeImageUrl(f.url)}} style={{width:'100%',height:125,borderRadius:10,backgroundColor:palette.line}}/>
          <Action danger small title="Excluir foto" disabled={loading} onPress={()=>Alert.alert('Remover foto','Excluir esta foto do brechó?',[{text:'Cancelar',style:'cancel'},{text:'Excluir',style:'destructive',onPress:()=>exec(`/painel-brecho/fotos/${f.id}`,'DELETE')}])}/>
        </View>)}</View>
        <Action title="Adicionar fotos" disabled={loading||(brecho?.fotos?.length||0)>=5} onPress={addPhotos}/>
      </Card>
      <Action danger title="Excluir minha conta e retirar o brechó do feed" onPress={deleteAccount}/>
    </>}
    {page==='pecas'&&<>{!requests.length&&<Card><Text style={s.muted}>Nenhuma peça enviada para avaliação ainda.</Text></Card>}
      {requests.map(r=><Card key={r.id}>
        <Text style={{color:palette.brown,fontSize:16,fontWeight:'700'}}>{r.categoria_peca} · {r.nome_usuario}</Text>
        <Text style={s.muted}>Marca: {r.marca||'Não informada'} · Tamanho: {r.tamanho||'—'}</Text>
        <View style={{alignSelf:'flex-start',backgroundColor:r.status==='APROVADO'?'#E2F5EA':r.status==='RECUSADO'?'#FBE8E4':'#F7EBDD',paddingVertical:6,paddingHorizontal:12,borderRadius:12,marginVertical:8}}>
          <Text style={{fontWeight:'700',color:r.status==='APROVADO'?'#26734B':r.status==='RECUSADO'?'#B34332':'#8A5A38'}}>
            {r.status==='APROVADO'?'✓ Aprovada':r.status==='RECUSADO'?'✕ Recusada':'◷ Pendente'}
          </Text>
        </View>
        {!!r.descricao&&<Text style={s.muted}>{r.descricao}</Text>}
        <View style={{flexDirection:'row',gap:8,marginVertical:8}}>{[r.foto_frente_url,r.foto_verso_url].filter(Boolean).map((url,i)=><Image key={i} source={{uri:safeImageUrl(url)}} style={{width:96,height:96,borderRadius:10}}/>)}</View>
        <Action secondary small title={r.status==='APROVADO'?'Peça aprovada':'Aprovar peça'} disabled={loading||r.status==='APROVADO'} onPress={()=>updateRequest(r.id,'APROVADO')}/>
        <Field label="Motivo da recusa" value={reasons[r.id]||r.motivo_recusa||''} onChangeText={v=>setReasons(o=>({...o,[r.id]:v}))} placeholder="Ex.: a peça apresenta manchas" multiline/>
        <Action danger small title={r.status==='RECUSADO'?'Peça recusada':'Recusar peça'} disabled={loading||r.status==='RECUSADO'} onPress={()=>updateRequest(r.id,'RECUSADO')}/>
      </Card>)}
    </>}
    {page==='reviews'&&<><Card><Text style={{fontSize:18,color:palette.brown,fontWeight:'700'}}>⭐ {rating.media??'Sem notas'} · {rating.total||0} avaliações</Text></Card>
      {!reviews.length&&<Card><Text style={s.muted}>Ainda não há comentários sobre sua loja.</Text></Card>}
      {reviews.map(r=><Card key={r.id}>
        <Text style={{fontSize:15,color:palette.brown,fontWeight:'700'}}>{r.usuario_nome} · ⭐ {r.nota}/5</Text>
        <Text style={[s.muted,{marginVertical:10}]}>{r.comentario}</Text>
        {!!r.resposta_brecho&&<Text style={s.muted}>Resposta atual: {r.resposta_brecho}</Text>}
        <Field label="Sua resposta ao comentário" multiline value={responses[r.id]??r.resposta_brecho??''} onChangeText={v=>setResponses(o=>({...o,[r.id]:v}))} placeholder="Agradeça ou esclareça a avaliação"/>
        <Action title="Publicar resposta" disabled={loading} onPress={()=>exec(`/painel-brecho/avaliacoes/${r.id}/resposta`,'PATCH',{resposta:responses[r.id]??r.resposta_brecho??''},'Resposta publicada.')}/>
      </Card>)}
    </>}
    <Action secondary title="Meu perfil" onPress={()=>router.push('/profile')}/>
    <Action secondary title="Sair do Alfinete" onPress={async()=>{await logout();router.replace('/');}}/>
  </ScrollView></SafeAreaView>;
}