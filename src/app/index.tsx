import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NotaSalva{
  dataChave: string
  titulo: string
  qtdEntradas: number
  qtdFotos: number
  dataObjeto: Date
}

export default function HomeScreen() {
  const router = useRouter()
  const[notas,setNotas] = useState<NotaSalva[]>([])

  const[subMenu,setSubMenu] = useState(false)
  const[notaSelecionada,setNotaSelecionada] = useState<NotaSalva | null>(null)

  useFocusEffect(
    useCallback(()=>{
      carregarNotas()
    },[])
  )

  const carregarNotas = async()=>{
    try{
      const todasChaves = await AsyncStorage.getAllKeys()
      const chavesDiario = todasChaves.filter(chave=>chave.startsWith("diario_"))

      if(chavesDiario.length === 0){
        setNotas([])
        return
      }
      const resultados = await AsyncStorage.multiGet(chavesDiario)
      const notasProcessadas: NotaSalva[]=resultados.map(([chave, valor])=>{
        const dataString = chave.replace("diario_","")
        const [dia,mes,ano] = dataString.split("/").map(Number)
        const dataObjeto = new Date(ano,mes-1,dia)
        if(valor){
          const dadosFinais = JSON.parse(valor)
          return{
            dataChave: dataString,
            titulo: dadosFinais.titulo,
            qtdEntradas: dadosFinais.entradas ? dadosFinais.entradas.length: 0,
            qtdFotos: dadosFinais.fotos ? dadosFinais.fotos.length: 0,
            dataObjeto: dataObjeto
          }
        }
        return null
      }).filter(item=>item !== null) as NotaSalva[]
      notasProcessadas.sort((a,b)=>b.dataObjeto.getTime()-a.dataObjeto.getTime())
      setNotas(notasProcessadas)
    } catch(error){
      console.error("Erro ao carregar lista de notas:", error)
    }
  }

  const abrirSubMenu = (nota:NotaSalva)=>{
    setNotaSelecionada(nota)
    setSubMenu(true)
  }
  const fecharSubMenu = ()=>{
    setSubMenu(false)
    setNotaSelecionada(null)
  }

  const abrirModoVisualizacao = (dataChave:string)=>{
    router.push({
      pathname: "/pagina",
      params: {data:dataChave, modo:"visualizar"}
    })
  }

  const abrirModoEdicao = ()=>{
    if(!notaSelecionada) return
    const dataChave = notaSelecionada.dataChave
    fecharSubMenu()

    router.push({
      pathname: "/pagina",
      params: {data:dataChave, modo:"editar"}
    })
  }

  const apagarNotaInteira = ()=>{
    if(!notaSelecionada) return
    Alert.alert("Apagar registro",`Tem certeza que deseja apagar o diário do dia ${notaSelecionada.dataChave}? Isso apagará as notas e fotos do dia.`,
      [
        { text: "Cancelar", style: "cancel"},
        {
          text: "Apagar",
          style: "destructive",
          onPress: async()=>{
            try {
              await AsyncStorage.removeItem(`diario_${notaSelecionada.dataChave}`)
              fecharSubMenu()
              carregarNotas()
              Alert.alert("Sucesso","O registro foi removido.")
            } catch(error){
              Alert.alert("Erro","Não foi possível apagar a nota.")
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Minhas memorias</Text>
      {notas.length === 0 ? (
        <View style={styles.containerVazio}>
          <Text style={styles.textoVazio}>Nenhum registro encontrado</Text>
          <Text style={styles.subTextoVazio}>Aperte no "+" para escrever sobre seu dia!</Text>
        </View>
      ):(
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {notas.map((nota)=>(
            <TouchableOpacity key={nota.dataChave} style={styles.cardNota} activeOpacity={0.7} onPress={()=> {abrirModoVisualizacao(nota.dataChave)}} onLongPress={()=>abrirSubMenu(nota)}>
              <View style={styles.topoCard}>
                <Text style={styles.cardData}>{nota.dataChave}</Text>
                <View style={styles.badgesContainer}>
                  {nota.qtdFotos>0 && (
                    <Text style={styles.badgeText}>📸 {nota.qtdFotos}</Text>
                  )}
                  <Text style={styles.badgeText}>✏️ {nota.qtdEntradas} {nota.qtdEntradas === 1 ? 'tópico' : 'tópicos'}</Text>
                </View>
              </View>
              <Text style={styles.cardTitulo}>{nota.titulo}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
        <TouchableOpacity style={styles.botaoFlutuante} activeOpacity={0.8} onPress={()=>router.push("/pagina")}>
          <Feather name='plus' size={30} color="#fff" />
        </TouchableOpacity>
        {subMenu && (
        <Modal animationType='slide' transparent={true} visible={subMenu} onRequestClose={fecharSubMenu}>
          <TouchableOpacity style={styles.fundoModal} activeOpacity={1} onPress={fecharSubMenu}>
            <View style={styles.conteudoSubMenu}>
              <View style={styles.indicadorMenu}/>
              <Text style={styles.tituloMenu}>Opções do registro ({notaSelecionada?.dataChave})</Text>
              <TouchableOpacity style={styles.opcaoBotao} onPress={abrirModoEdicao}>
                <Feather name='edit-2' size={20} color="#4A90E2" style={styles.opcaoIcone}/>
                <Text style={styles.opcaoTexto}>Editar Registro</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.opcaoBotao} onPress={apagarNotaInteira}>
                <Feather name='trash-2' size={20} color="#EF4444" style={styles.opcaoIcone}/>
                <Text style={[styles.opcaoTexto, {color: "#EF4444"}]}>Apagar Permanentemente</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoCancelarMenu} onPress={fecharSubMenu}>
                <Text style={styles.textoCancelarMenu}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        )}
    </View>
  )  
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#F5F5F5', 
    paddingTop: 60
  },
  header:{
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 20,
    marginBottom: 15
  },
  scrollContent:{
    paddingHorizontal: 20,
    paddingBottom: 100
  },
  cardNota:{
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2
  },
  topoCard:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  cardData:{
    fontSize: 14,
    fontWeight: "bold",
    color: "#4A90E2"
  },
  badgesContainer:{
    flexDirection: "row"
  },
  badgeText:{
    fontSize: 12,
    color: "#777",
    backgroundColor: "#ECEFF1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginLeft: 6
  },
  cardTitulo:{
    fontSize: 18,
    fontWeight: "bold",
    color: "#333"
  },
  containerVazio:{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40
  },
  textoVazio: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
    marginBottom: 5
  },
  subTextoVazio:{
    fontSize: 14,
    color: "#999",
    textAlign: "center"
  },
  botaoFlutuante:{
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#4A90E2",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: 'center',
    elevation: 5,
    zIndex: 99
  },
  fundoModal:{
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end"
  },
  conteudoSubMenu:{
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 35,
    paddingTop: 15,
    alignItems: "center"
  },
  indicadorMenu:{
    width: 40,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
    marginBottom: 15
  },
  tituloMenu:{
    fontSize: 14,
    fontWeight: "bold",
    color: "#777",
    marginBottom: 20
  },
  opcaoBotao:{
    flexDirection: "row",
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  opcaoIcone:{
    marginRight: 15
  },
  opcaoTexto:{
    fontSize: 16,
    fontWeight: "600",
    color: "#333"
  },
  botaoCancelarMenu:{
    marginTop: 15,
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    alignItems: "center"
  },
  textoCancelarMenu: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666"
  }
});