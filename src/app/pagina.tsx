"use client"

import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function DiarioScreen(){
    const [titulo,setTitulo] = useState("")
    const [texto,setTexto] = useState("")

    const dataAtual = new Date().toLocaleDateString('pt-BR')

    const salvarNota = ()=>{
        if (!titulo || !texto) {
            alert("Por favor, preencha o título e o conteúdo antes de salvar!")
            return
        } alert ("Nota salva com sucesso")
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
            placeholder="Ditite o título da sua nota"
            placeholderTextColor="#999"
            value={titulo}
            onChangeText={setTitulo}
            />

            <TextInput 
            style={styles.inputConteudo}
            placeholder="..."
            placeholderTextColor='#999'
            multiline={true}
            textAlignVertical="top"
            value={texto}
            onChangeText={setTexto}
            />

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
    inputConteudo: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        height: 300,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    botaoSalvar: {
        backgroundColor: '#4A90E2',
        padding: 15,
        borderRadius: 8,
        alignContent: 'center'
    },
    botaoTexto: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    }
})