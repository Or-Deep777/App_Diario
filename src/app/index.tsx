import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Minha Tela Inicial</Text>
      
      {/* O Link força o Expo Router a renderizar a página sem recarregar o navegador */}
      <Link href="/pagina" style={styles.botao}>
        <Text style={styles.textoBotao}>Ir para o Diário 📖</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  botao: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 8 },
  textoBotao: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});