import { View, Text, StyleSheet } from "react-native";
import {
  MaterialIcons,
  Entypo,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { useTheme } from "../../context/themeContext";

const AboutAppComponent = () => {
  const { colors } = useTheme();

  const primaryColor = "#17cbebff";

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        🛠 Si të përdorni aplikacionin
      </Text>

      <View style={styles.step}>
        <MaterialIcons name="account-circle" size={22} color={primaryColor} />
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {" "}
          1. Krijo një llogari / Hyr
        </Text>
      </View>
      <Text style={[styles.bullet, { color: colors.textSecondary }]}>
        • Hap aplikacionin dhe regjistrohu duke përdorur emailin ose rrjetet
        sociale.
      </Text>
      <Text style={[styles.bullet, { color: colors.textSecondary }]}>
        • Nëse tashmë ke një llogari, shtyp “Hyr”.
      </Text>

      <View style={styles.step}>
        <Entypo name="camera" size={20} color={primaryColor} />
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {" "}
          2. Raporto një problem
        </Text>
      </View>
      <Text style={[styles.bullet, { color: colors.textSecondary }]}>
        • Shtyp butonin “Kamera” në navbar.
      </Text>
      <Text style={[styles.bullet, { color: colors.textSecondary }]}>
        • Shto një titull, përshkrim dhe nëse dëshiron, ngarko një foto të
        problemut.
      </Text>
      <Text style={[styles.bullet, { color: colors.textSecondary }]}>
        • Mund të përdorësh edhe vendndodhjen GPS për të shënuar ku ndodhet
        problemi.
      </Text>

      <View style={styles.step}>
        <MaterialIcons name="send" size={20} color={primaryColor} />
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {" "}
          3. Dërgo raportin
        </Text>
      </View>
      <Text style={[styles.bullet, { color: colors.textSecondary }]}>
        • Pasi të kesh plotësuar të gjitha detajet, shtyp “Dërgo”.
      </Text>
      <Text style={[styles.bullet, { color: colors.textSecondary }]}>
        • Raporti do t’i dërgohet departamentit lokal të mirëmbajtjes.
      </Text>

      <View style={styles.step}>
        <FontAwesome5 name="tasks" size={20} color={primaryColor} />
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {" "}
          4. Ndiq progresin
        </Text>
      </View>
      <Text style={[styles.bullet, { color: colors.textSecondary }]}>
        • Shko te seksioni “Raportimet e mia” për të parë nëse raporti yt është
        Në pritje, Në proces apo I rregulluar.
      </Text>

      <View style={styles.step}>
        <Ionicons name="help-buoy-outline" size={20} color={primaryColor} />
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {" "}
          5. Kontakto mbështetjen
        </Text>
      </View>
      <Text style={[styles.bullet, { color: colors.textSecondary }]}>
        • Vizito seksionin “Informacione Kontakti” për t’i dërguar mesazh ekipit
        të mbështetjes FixIt.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 5,
  },
  bullet: {
    fontSize: 14,
    marginLeft: 30,
    lineHeight: 20,
  },
});

export default AboutAppComponent;
