import { Feather } from '@expo/vector-icons';
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface entradaItem {
    id: number
    conteudo: string
}

export default function DiarioScreen(){
    const [titulo,setTitulo] = useState("")

    const [entrada,setEntrada] = useState<entradaItem[]>([
        {id:Date.now(), conteudo:""}
    ])

    const dataAtual = new Date().toLocaleDateString('pt-BR')

    const addNovaEntrada=()=>{
        const novaEntrada: entradaItem={
            id:Date.now(), conteudo:""
        }
        setEntrada([...entrada,novaEntrada])
    }

    const atualizarEntrada=(id:number, campo:"subtitulo" | "conteudo", valor: string)=>{
        const entradaAtualizada=entrada.map(item=>{
            if(item.id === id){
                return{...item, [campo]:valor}
            }
            return item
        })
        setEntrada(entradaAtualizada)
    }

    /*const deletarEntrada=(id:number)=>{
        if (entrada.length===1){
            Alert.alert("Não foi possível deletar a nota")
            return
        } Alert.alert("Apagar nota?","Deseja realmente apagar a nota",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Confirmar",
                    style: "destructive",
                    onPress:()=>executarExclusao(id)
                }
            ]
        )
    }*/

    const deletarEntrada=(id:number)=>{
        if (entrada.length===1){
            alert("Não foi possível deletar a nota")
            return
        } const confirmou = window.confirm("Deseja apagar a nota?")
        if (confirmou) {
            const entradaFiltrada=entrada.filter(item=>item.id !==id)
            setEntrada(entradaFiltrada)
        }
    }

    const executarExclusao = (id:number)=>{
        const entradaFiltrada=entrada.filter(item=>item.id !==id)
        setEntrada(entradaFiltrada)
    }

    const salvarNota = ()=>{
        if (!titulo) {
            alert("Por favor, preencha o título e o conteúdo antes de salvar!")
            return
        }

        if (entrada.length === 0 || !entrada[0].conteudo){
            alert("Por favor, escreva algo na primeira entrada!")
            return
        }
        alert(`Nota: "${titulo}" salva com sucesso!`)
    }

    return(
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.header}>Meu Diário</Text>
            <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Data:</Text>
                <Text style={styles.dateText}>{dataAtual}</Text>
            </View>

            <TextInput 
            style={styles.inputTitulo}
            placeholder="Digite o título da sua nota"
            placeholderTextColor="#999"
            value={titulo}
            onChangeText={setTitulo}
            />

            {entrada.map((item)=>(
                <View style={styles.blocoEntrada}>
                    <TouchableOpacity onPress={()=>deletarEntrada(item.id)} style={styles.botaoLixeira}>
                        <Feather name="trash-2" size={24} color="black" />
                        </TouchableOpacity>
                    <TextInput 
                    style={styles.inputConteudo}
                    placeholder="..."
                    placeholderTextColor="#999"
                    multiline={true}
                    textAlignVertical="top"
                    value={item.conteudo}
                    onChangeText={(valor)=>atualizarEntrada(item.id,"conteudo",valor)}
                    />
                </View>
            ))}

            <TouchableOpacity onPress={addNovaEntrada} style={styles.botaoAdicionar}>
                <Text style={styles.botaoAdicionarTexto}>Novo topico</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={salvarNota} style={styles.botaoSalvar}>
                <Text style={styles.botaoTexto}>Salvar Nota</Text>
            </TouchableOpacity>
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
        marginBottom: 20
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
    }
})