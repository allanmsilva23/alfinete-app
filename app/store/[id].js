import React,{useCallback,useState} from 'react';
import {View,Text,ScrollView,Image,TouchableOpacity,TextInput,Linking,Alert,StyleSheet,ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useLocalSearchParams,useFocusEffect,useRouter} from 'expo-router';
import {Feather,Ionicons,FontAwesome} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import FavoriteToggle from '../../components/FavoriteToggle';
import {api,safeImageUrl} from '../../src/api/client';
import {useAuth} from '../../src/auth/AuthContext';

export default function StoreProfile(){
  const params=useLocalSearchParams(),id=Array.isArray(params.id)?params.id[0]:params.id;
  const router=useRouter(),{user}=useAuth();
  const [store,setStore]=useState(null),[loading,setLoading]=useState(true),[sending,setSending]=useState(false);
  const [rating,setRating]=useState(5),[comment,setComment]=useState('');
  const load=useCallback(async()=>{if(!id)return;try{setLoading(true);setStore(await api(`/brechos/${id}`,{auth:false}));}
    catch(e){Alert.alert('Brechó indisponível',e.message);setStore(null);}finally{setLoading(false);}},[id]);
  useFocusEffect(useCallback(()=>{load();},[load]));
  const sendReview=async()=>{
    if(!user)return Alert.alert('Login necessário','Entre para avaliar um brechó.',[{text:'Entrar',onPress:()=>router.push('/')},{text:'Cancelar'}]);
    if(user.tipo_conta!=='cliente')return Alert.alert('Acesso restrito','Somente clientes podem avaliar brechós.');
    if(comment.trim().length<2)return Alert.alert('Escreva um comentário','Conte sobre sua experiência com o brechó.');
    try{setSending(true);await api('/avaliacoes',{method:'POST',body:{brecho_id:id,nota:rating,comentario:comment.trim()}});
      setComment('');setRating(5);await load();Alert.alert('Obrigado!', 'Sua avaliação já aparece na página do brechó.');
    }catch(e){Alert.alert('Erro na avaliação',e.message);}finally{setSending(false);}
  };
  const open=(type)=>{
    if(!store)return;
    if(type==='whatsapp'){
      const digits=String(store.telefone||'').replace(/\D/g,'');
      if(!digits)return Alert.alert('Indisponível','O brechó ainda não informou o WhatsApp.');
      Linking.openURL(`https://wa.me/${digits.startsWith('55')?digits:`55${digits}`}`);return;
    }
    if(type==='instagram'){
      const raw=String(store.link_instagram||'').trim();
      if(!raw)return Alert.alert('Indisponível','Este brechó ainda não informou o Instagram.');
      const handle=raw.replace(/^https?:\/\/(www\.)?instagram\.com\//i,'').replace(/^@/,'').split(/[/?#]/)[0];
      if(!/^[\w.]{1,30}$/.test(handle))return Alert.alert('Instagram inválido','O endereço cadastrado precisa ser corrigido pelo brechó.');
      Linking.openURL(`https://www.instagram.com/${handle}/`);return;
    }
    const address=store.endereco_completo;
    const label=address?.logradouro?[address.logradouro,address.numero,address.bairro,address.cidade,address.estado].filter(Boolean).join(', '):store.endereco_curto;
    if(label)Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`);
    else Alert.alert('Endereço indisponível','Este brechó ainda não cadastrou um endereço.');
  };
  if(loading&&!store)return <SafeAreaView style={styles.container}><ActivityIndicator color="#A0452C" style={{marginTop:100}}/></SafeAreaView>;
  if(!store)return <SafeAreaView style={styles.container}><TouchableOpacity onPress={()=>router.back()}><Text style={{padding:24,color:'#A0452C'}}>‹ Voltar aos brechós</Text></TouchableOpacity><Text style={{textAlign:'center'}}>Brechó indisponível.</Text></SafeAreaView>;
  const images=(store.fotos||[]).map(x=>safeImageUrl(x.url)).filter(Boolean);
  const cover=images[0]||safeImageUrl(store.imagem);
  const address=store.endereco_completo?.logradouro?[store.endereco_completo.logradouro,store.endereco_completo.numero,store.endereco_completo.bairro,store.endereco_completo.cidade,store.endereco_completo.estado].filter(Boolean).join(', '):store.endereco_curto;
  return <SafeAreaView style={styles.container} edges={['bottom']}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:35}}>
    <View style={styles.coverContainer}>
      {cover?<Image source={{uri:cover}} style={styles.coverImage}/>:<View style={[styles.coverImage,{backgroundColor:'#EAE0D0',alignItems:'center',justifyContent:'center'}]}><Feather name="shopping-bag" size={50} color="#A06D44"/></View>}
      <TouchableOpacity style={styles.backButton} onPress={()=>router.back()}><Feather name="arrow-left" size={24} color="#A06D44"/></TouchableOpacity>
    </View>
    <View style={styles.content}>
      <View style={styles.header}><Text style={styles.storeName}>{store.nome}</Text><FavoriteToggle storeId={id} size={25}/></View>
      <Text style={styles.description}>{store.descricao||'Brechó integrante da comunidade Alfinete.'}</Text>
      <Text style={{color:'#8A5A38',fontWeight:'700',marginBottom:14}}>⭐ {store.nota_media??'Sem notas'} · {store.total_avaliacoes||0} avaliações</Text>
      {images.length>1&&<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:15}}>{images.map((img,i)=><Image key={i} source={{uri:img}} style={{width:140,height:110,borderRadius:12,marginRight:10}}/>)}</ScrollView>}
      <View style={styles.infoCard}><Text style={styles.infoTitle}>Endereço</Text><Text style={styles.infoText}>{address||'Não informado'}</Text></View>
      <View style={styles.infoCard}><Text style={styles.infoTitle}>Horário de funcionamento</Text><Text style={styles.infoText}>{store.horario_funcionamento||'Consulte o brechó'}</Text></View>
      <View style={styles.infoCard}><Text style={styles.infoTitle}>Faixa de preço</Text><Text style={styles.infoText}>{store.faixa_preco||'Não informada'}</Text></View>
      <View style={styles.infoCard}><Text style={styles.infoTitle}>Regras para avaliação de roupas</Text><Text style={styles.infoText}>{store.regras_avaliacao||'Consulte o brechó antes de enviar suas peças.'}</Text></View>
      <TouchableOpacity style={styles.buttonWrapper} onPress={()=>open('instagram')}><LinearGradient colors={['#D97743','#E3A642']} style={styles.gradientButton}><Feather name="instagram" size={20} color="#FFF"/><Text style={styles.contactButtonText}>  Abrir Instagram</Text></LinearGradient></TouchableOpacity>
      <TouchableOpacity style={styles.buttonWrapper} onPress={()=>open('whatsapp')}><LinearGradient colors={['#5CE1E6','#B2F4EC']} style={styles.gradientButton}><Ionicons name="logo-whatsapp" size={20} color="#A06D44"/><Text style={[styles.contactButtonText,{color:'#A06D44'}]}>  Abrir WhatsApp</Text></LinearGradient></TouchableOpacity>
      <TouchableOpacity style={styles.outlineButton} onPress={()=>open('maps')}><Feather name="navigation" size={18} color="#A06D44"/><Text style={styles.outlineButtonText}>  Como chegar</Text></TouchableOpacity>
      <TouchableOpacity style={styles.buttonWrapper} onPress={()=>{if(!user)return router.push('/');router.push({pathname:`/evaluate/${id}`,params:{storeName:store.nome}});}}><LinearGradient colors={['#D97743','#C95E42']} style={styles.gradientButton}><Feather name="camera" size={20} color="#FFF"/><Text style={styles.contactButtonText}>  Enviar peça para avaliação</Text></LinearGradient></TouchableOpacity>
      <View style={[styles.infoCard,{marginTop:25,backgroundColor:'#FFF9F0'}]}>
        <Text style={styles.formMainTitle}>Deixe seu alfinete 📌</Text>
        <Text style={styles.labelNota}>Sua nota</Text>
        <View style={styles.starsRow}>{[1,2,3,4,5].map(star=><TouchableOpacity key={star} onPress={()=>setRating(star)}><FontAwesome name={star<=rating?'star':'star-o'} size={26} color="#D4A373" style={{marginRight:8}}/></TouchableOpacity>)}</View>
        <TextInput style={styles.commentInput} placeholder="Conte como foi sua experiência..." placeholderTextColor="#AAA" multiline maxLength={1500} value={comment} onChangeText={setComment}/>
        <TouchableOpacity style={styles.buttonWrapper} onPress={sendReview} disabled={sending}><LinearGradient colors={['#D97743','#E3A642']} style={styles.gradientButton}><Text style={styles.contactButtonText}>{sending?'Enviando...':'Enviar opinião'}</Text></LinearGradient></TouchableOpacity>
      </View>
      <Text style={[styles.formMainTitle,{marginVertical:18}]}>Avaliações da comunidade</Text>
      {(store.avaliacoes||[]).length?(store.avaliacoes||[]).map(av=><View key={av.id} style={styles.infoCard}>
        <View style={styles.rowBetween}><Text style={styles.infoTitle}>{av.nome_usuario}</Text><Text style={{color:'#D4A373'}}>⭐ {av.nota}/5</Text></View>
        <Text style={styles.infoText}>{av.comentario}</Text>
        {!!av.resposta_brecho&&<View style={{marginTop:12,padding:10,backgroundColor:'#FAF0E6',borderRadius:8}}><Text style={{color:'#A06D44',fontWeight:'700'}}>Resposta do brechó</Text><Text style={styles.infoText}>{av.resposta_brecho}</Text></View>}
      </View>):<Text style={styles.infoText}>Seja a primeira pessoa a avaliar este brechó.</Text>}
    </View>
  </ScrollView></SafeAreaView>;
}

const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:'#FAF8F5'},coverContainer:{position:'relative'},coverImage:{width:'100%',height:250},backButton:{position:'absolute',top:40,left:20,backgroundColor:'#FFF',padding:10,borderRadius:20},content:{padding:20},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},storeName:{fontSize:22,fontWeight:'bold',color:'#A06D44',flex:1,paddingRight:10},description:{color:'#888',marginTop:10,lineHeight:22,marginBottom:15},
  infoCard:{backgroundColor:'#FFFDF9',borderWidth:1,borderColor:'#EAE0D0',padding:15,borderRadius:16,marginBottom:15},infoTitle:{fontWeight:'bold',color:'#A06D44',fontSize:15},infoText:{color:'#666',marginTop:8,fontSize:13,lineHeight:20},rowBetween:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  buttonWrapper:{marginTop:15,borderRadius:25,overflow:'hidden'},gradientButton:{flexDirection:'row',justifyContent:'center',alignItems:'center',padding:16},contactButtonText:{color:'#FFF',fontWeight:'bold',fontSize:16},
  outlineButton:{flexDirection:'row',justifyContent:'center',alignItems:'center',backgroundColor:'#FFF',borderWidth:1.5,borderColor:'#D8C5B3',padding:14,borderRadius:25,marginTop:15},outlineButtonText:{color:'#A06D44',fontWeight:'bold'},
  formMainTitle:{fontSize:19,fontWeight:'bold',color:'#A06D44'},labelNota:{color:'#8A5A38',fontWeight:'600',marginVertical:12},starsRow:{flexDirection:'row',marginBottom:14},commentInput:{minHeight:92,borderWidth:1,borderColor:'#EAE0D0',backgroundColor:'#FFF',borderRadius:12,padding:12,textAlignVertical:'top',color:'#8A5A38'}
});