import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AppLayout from '../../components/shared/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../constants/theme';

export default function DashboardNadador() {
  const { user } = useAuth();

  return (
    <AppLayout role="nadador" title={`Hola, ${user?.nombre?.split(' ')[0]}`}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroSub}>Panel del Atleta</Text>
          <Text style={styles.heroName}>{user?.nombre}</Text>
        </View>

        {/* Cards rápidas */}
        <View style={styles.grid}>
          <QuickCard emoji="⏱" label="Mis Marcas" color={theme.colors.blue600} />
          <QuickCard emoji="💪" label="Entrenos" color={theme.colors.green500} />
          <QuickCard emoji="🏆" label="Competencias" color={theme.colors.orange500} />
          <QuickCard emoji="📅" label="Calendario" color={theme.colors.slate700} />
        </View>

      </ScrollView>
    </AppLayout>
  );
}

const QuickCard = ({ emoji, label, color }: any) => (
  <TouchableOpacity style={[styles.card, { borderTopColor: color, borderTopWidth: 3 }]}>
    <Text style={styles.cardEmoji}>{emoji}</Text>
    <Text style={styles.cardLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, gap: 20 },
  hero: {
    backgroundColor: theme.colors.slate900,
    borderRadius: theme.radius.xxxl,
    padding: 28,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.slate400,
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginBottom: 8,
  },
  heroName: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.colors.white,
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.slate100,
    alignItems: 'flex-start',
    gap: 8,
  },
  cardEmoji: { fontSize: 28 },
  cardLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: theme.colors.slate700,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});