import { Feather } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface entradaItem {
    id: number
    conteudo: string
}

export default function DiarioScreen(){
    const [titulo,setTitulo] = useState("")
    const [fotos,setFotos] = useState<string[]>([])
    const { data, modo } = useLocalSearchParams<{data?:string; modo?:"visualizar" | "editar"}>()
    const obterDataInicial = ()=>{
        if (data) {
            const [dia,mes,ano] = data.split("/").map(Number)
            return new Date(ano, mes-1, dia)
        }
        return new Date()
    }
    const [dataSelecionada,setDataSelecionada] = useState(obterDataInicial())
    const [calendario,setCalendario] = useState(false)
    const [mudou,setMudou] = useState(false)
    const [notaExiste,setNotaExiste] = useState(false)
    
    const [entrada,setEntrada] = useState<entradaItem[]>([
        {id:Date.now(), conteudo:""}
    ])

    const voltar=()=>{
        if(modo === "visualizar" || !mudou){
            router.back()
            return
        }
        Alert.alert("Alterações não salvas", "Você fez alterações nesse dia e não salvou, voltar agora apagará as modificações mais recentes",
        [
            {text: "Ficar na tela", style: "cancel"},
            {
                text: "Sair mesmo assim",
                style: "destructive",
                onPress:()=>router.back()
            }
        ])
    }

    const verificarNota = async(dataChecar:string)=>{
        if (modo === "visualizar" || (modo === "editar" && dataChecar === data)){
            setNotaExiste(false)
            return
        }
        try{
            const chaveData = `diario_${dataChecar}`
            const dadosTexto = await AsyncStorage.getItem(chaveData)
            setNotaExiste(dadosTexto !== null)
        } catch(error){
            console.error("Erro ao checar nota existente:", error)
        }
    }

    useEffect(()=>{
        const dataFormatada = dataSelecionada.toLocaleDateString("pt-BR")
        verificarNota(dataFormatada)
        if (data && (modo === "visualizar" || modo === "editar")){
            carregarDados()
        }
    }, [data, modo])

    const mudarData = (event:any,dateSelected?:Date)=>{
        setCalendario(false)

        if (event.type === "set" && dateSelected){
            setDataSelecionada(dateSelected)
            const novaDataTexto = dateSelected.toLocaleDateString("pt-BR")
            verificarNota(novaDataTexto)
        }
    }

    const tratarMudancaTitulo = (texto:string)=>{
        setTitulo(texto)
        if(modo !== "visualizar") setMudou(true)
    }

    const addNovaEntrada=()=>{
        const novaEntrada: entradaItem={
            id:Date.now(), 
            conteudo:""
        }
        setEntrada([...entrada,novaEntrada])
        setMudou(true)
    }

    useEffect(()=>{
        if (data && (modo === "visualizar" || modo === "editar")){
            carregarDados()
        }
    },[data, modo])

    const carregarDados = async()=>{
        try{
            const chaveData = `diario_${data}`
            const dadosTexto = await AsyncStorage.getItem(chaveData)
            console.log("Chave buscada:", chaveData)
            console.log("Conteúdo encontrado no celular:", dadosTexto)

            if (dadosTexto){
                const dadosValidos = JSON.parse(dadosTexto)
                setTitulo(dadosValidos.titulo)
                setEntrada(dadosValidos.entradas || [])
                setFotos(dadosValidos.fotos || [])
            }
        } catch(error){
            console.error("Erro ao carregar dados do dia:", error)
            Alert.alert("Erro", "Não foi possível carregar os registros desse dia")
        }
    }

    const atualizarEntrada=(id:number, valor: string)=>{
        const entradaAtualizada=entrada.map(item=>{
            if(item.id === id){
                return{...item, conteudo:valor}
            }
            return item
        })
        setEntrada(entradaAtualizada)
        setMudou(true)
    }

    const deletarEntrada=(id:number)=>{
        if (entrada.length===1){
            Alert.alert("Atenção","Seu diário precisa ter pelo menos um tópico")
            return
        } Alert.alert("Apagar nota","Deseja realmente apagar a nota?",
            [
                {text: "Cancelar", style: "cancel"},
                {text: "Confirmar", style: "destructive", onPress:()=>executarExclusao(id)}
            ]
        )
    }

    const executarExclusao = (id:number)=>{
        const entradaFiltrada=entrada.filter(item=>item.id !==id)
        setEntrada(entradaFiltrada)
    }

    const executarSalvar = async()=>{
        try{
            const dadosDiario={
                titulo: titulo,
                entradas: entrada,
                fotos: fotos
            }
            const chaveData = `diario_${dataSelecionada.toLocaleDateString("pt-BR")}`
            const dadosTexto = JSON.stringify(dadosDiario)
            await AsyncStorage.setItem(chaveData,dadosTexto)
            Alert.alert("Sucesso","Suas memórias foram registradas", [
                {
                    text: "OK",
                    onPress:()=>{
                        setMudou(false)
                        if(router.canGoBack()){
                            router.back()
                        }else{
                            router.replace("/")
                        }
                    }
                }
            ])
        } catch(error){
            console.error(error)
            Alert.alert("Erro","Não foi possível salvar a nota")
        }
    }

    const salvarNota = async()=>{
        if (!titulo.trim()) {
            Alert.alert("Erro","Por favor, preencha o título principal!")
            return
        }

        if (entrada.length === 0 || !entrada[0].conteudo.trim()){
            Alert.alert("Erro","Por favor, escreva algo na primeira entrada!")
            return
        }
        if (notaExiste) {
            Alert.alert("Substituir Registro?","Já existe uma memória registrada nesse dia. Salvar vai substituir o registro anterior.",
                [
                    { text: "Cancelar", style: "cancel"},
                    {
                        text: "Substituir",
                        style: "destructive",
                        onPress:()=>executarSalvar()
                    }
                ]
            )
            return
        }
        executarSalvar()
    }

    const escolhaImagem = async()=>{
        let imgEscolhida = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality:1
        })
        if (!imgEscolhida.canceled){
            const novasFotos = imgEscolhida.assets.map(asset=>asset.uri)
            setFotos([...fotos,...novasFotos])
            setMudou(true)
        }
    }

    const removerFoto = (indexRemover:number)=>{
        const fotosFiltradas = fotos.filter((_,index)=>index!==indexRemover)
        setFotos(fotosFiltradas)
        setMudou(true)
    }

    return(
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <TouchableOpacity style={styles.botaoVoltar} onPress={voltar} activeOpacity={0.6}>
                <Feather name="arrow-left" size={24} color="#4A90E2"/>
                <Text style={styles.textoVoltar}>Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.header}>{modo === "visualizar" ? "Bom vê-lo novamente" : "Como foi seu dia?"}</Text>
            <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Data:</Text>
                <TouchableOpacity style={styles.inputData} onPress={()=>modo !== "visualizar" && setCalendario(true)} activeOpacity={modo === "visualizar" ? 1:0.7}>
                    <Text style={styles.textoDataBotao}>
                        {dataSelecionada.toLocaleDateString("pt-BR")}
                    </Text>
                </TouchableOpacity>
                {notaExiste && (
                    <TouchableOpacity style={styles.alertaData} onPress={()=>Alert.alert("Conflito nos dias","Já existe uma memória registrada nesse dia. Salvar vai substituir o registro anterior.")}>
                        <Feather name='alert-triangle' size={22} color="#F59E0B"/>
                    </TouchableOpacity>
                )}
                {calendario && (
                    <DateTimePicker 
                        value={dataSelecionada}
                        mode="date"
                        display='default'
                        onChange={mudarData}
                        maximumDate={new Date()}
                    />
                )}
            </View>

            <TextInput 
            style={styles.inputTitulo}
            placeholder="Digite o título da sua nota"
            placeholderTextColor="#999"
            value={titulo}
            onChangeText={setTitulo}
            editable={modo !== "visualizar"}
            />

            {entrada.map((item)=>(
                <View key={item.id} style={styles.blocoEntrada}>
                    {modo !== "visualizar" && (
                        <TouchableOpacity onPress={()=>deletarEntrada(item.id)} style={styles.botaoLixeira}>
                            <Feather name="trash-2" size={24} color="#EF4444" />
                        </TouchableOpacity>
                    )}
                    <TextInput 
                    style={styles.inputConteudo}
                    placeholder="..."
                    placeholderTextColor="#999"
                    multiline={true}
                    textAlignVertical="top"
                    value={item.conteudo}
                    onChangeText={(valor)=>atualizarEntrada(item.id,valor)}
                    editable={modo !== "visualizar"}
                    />
                </View>
            ))}

            {modo !== "visualizar" && (
                <TouchableOpacity onPress={addNovaEntrada} style={styles.botaoAdicionar}>
                    <Text style={styles.botaoAdicionarTexto}>Novo topico</Text>
                </TouchableOpacity>
            )}

            <View style={styles.secaoFotos}>
                <Text style={styles.tituloSecao}>Fotos</Text>
                <ScrollView style={styles.listaFotos} horizontal={true} showsHorizontalScrollIndicator={false}>
                    {fotos.map((uri,index)=>(
                        <View key={index} style={styles.containerFoto}>
                            <Image source={{uri:uri}} style={styles.fotoMiniatura}/>
                            {modo !== "visualizar" && (
                                <TouchableOpacity style={styles.botaoRemoverFoto} onPress={()=>removerFoto(index)}>
                                    <Text style={styles.textoRemoverFoto}>x</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </ScrollView>
                {modo !== "visualizar" && (
                    <TouchableOpacity style={styles.botaoAddFoto} onPress={escolhaImagem}>
                        <Text style={styles.botaoAddFotoTexto}>Adicionar foto</Text>
                    </TouchableOpacity>
                )}
            </View>

            {modo !== "visualizar" && (
                <TouchableOpacity onPress={salvarNota} style={styles.botaoSalvar}>
                    <Text style={styles.botaoTexto}>Salvar Nota</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'#F5F5F5'
    },
    contentContainer: {
        padding: 20,
        paddingTop: 60
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20
    },
    dateContainer: {
        flexDirection: 'row',
        marginBottom:15
    },
    dateLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 5,
    },
    dateText: {
        fontSize: 16,
        color: '#666'
    },
    inputTitulo: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    blocoEntrada: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        height: 300,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.1,
        position: "relative"
    },
    botaoLixeira: {
        position: "absolute",
        top: 15,
        right: 15,
        zIndex: 10,
        padding: 5
    },
    inputConteudo: {
        fontSize: 16,
        height: 150,
        color: "#333",
        paddingRight: 40
    },
    botaoAdicionar: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#4A90E2',
        borderStyle: 'dashed',
        alignItems: 'center',
        marginBottom: 10
    },
    botaoAdicionarTexto: {
        color: '#4A90E2',
        fontSize: 16,
        fontWeight: 'bold'
    },
    botaoSalvar: {
        backgroundColor: '#4A90E2',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center'
    },
    botaoTexto: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    secaoFotos:{
        marginTop:10,
        marginBottom: 20,
        backgroundColor:"#fff",
        padding:15,
        borderRadius:8,
        borderWidth:1,
        borderColor:"#E0E0E0"
    },
    tituloSecao:{
        fontSize:16,
        fontWeight:"bold",
        color:"#444",
        marginBottom:10
    },
    listaFotos:{
        flexDirection:"row",
        marginBottom:10
    },
    containerFoto:{
        position:"relative",
        marginBottom:10
    },
    fotoMiniatura:{
        width:80,
        height:80,
        borderRadius:6
    },
    botaoRemoverFoto:{
        position:"absolute",
        top:-5,
        right: -5,
        backgroundColor: "#EF4444",
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    textoRemoverFoto:{
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
        lineHeight: 16
    },
    botaoAddFoto:{
        backgroundColor: "#ECEFF1",
        padding: 12,
        borderRadius: 8,
        alignItems: "center"
    },
    botaoAddFotoTexto:{
        color: "#37474F",
        fontSize: 16,
        fontWeight: "bold"
    },
    inputData:{
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 6,
        paddingHorizontal: 15,
        paddingVertical: 8
    },
    textoDataBotao:{
        fontSize: 16,
        color: "#4A90E2",
        fontWeight: "600"
    },
    botaoVoltar:{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        marginBottom: 10,
        alignSelf: "flex-start"
    },
    textoVoltar:{
        fontSize: 16,
        color: "#4A90E2",
        fontWeight: "600",
        marginLeft: 6
    },
    alertaData:{
        marginLeft: 10,
        justifyContent: "center",
        alignItems: "center",
        padding: 5
    }
})