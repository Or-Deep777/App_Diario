import { useRouter } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import { useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { supabase } from "../supabase"

WebBrowser.maybeCompleteAuthSession()

export default function AuthIndex(){
    const router = useRouter()
    const [session,setSession] = useState<any>(null)
    const [loading,setLoading] = useState(true)

    useEffect(()=>{
        supabase.auth.getSession().then(({data:{session}})=>{
            setSession(session)
            setLoading(false)
            if (session){
                router.replace('/menu')
            }
        })
        const {data:{subscription}}=supabase.auth.onAuthStateChange((_event, currentSession)=>{
            setSession(currentSession)
            if (currentSession) {
                router.replace("/menu")
            }
        })
        return()=>subscription.unsubscribe()
    },[])
    async function realizarLoginGoogle() {
        try{
            const {data,error} = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: "diario://menu",
                    skipBrowserRedirect: true
                }
            })
            if (error) throw error
            const resultadoAuth = await WebBrowser.openAuthSessionAsync(
                data?.url ?? "",
                "diario://"
            )
            if (resultadoAuth.type !== "success") return
            const urlRetorno = resultadoAuth.url
            const params = new URLSearchParams(urlRetorno.split('#')[1] || urlRetorno.split('?')[1])
            const accessToken = params.get("access_token")
            const refreshToken = params.get("refresh_token")
            if (accessToken && refreshToken) {
                await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                })
            }
        } catch (err) {
            console.error("Erro ao fazer login com o Google:", err)
        }
    }
    if (loading){
        return(
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#4285F4" />
            </View>
        )
    }
    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Meu Diário</Text>
            <Text style={styles.subtitulo}>Livre para se abrir</Text>
            <TouchableOpacity style={styles.botaoGoogle} onPress={realizarLoginGoogle}>
                <Text style={styles.textoBotao}>Entrar com Google</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FAF8F5",
        padding: 20
    },
    titulo:{
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#333"
    },
    subtitulo:{
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 40
    },
    botaoGoogle:{
        backgroundColor: "#4285F4",
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: {width:0,height:2},
        shadowOpacity: 0.2,
        shadowRadius: 2
    },
    textoBotao:{
        color: "white",
        fontWeight: "bold",
        fontSize: 16
    }
})