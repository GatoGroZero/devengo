import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  fetchOnchainBob,
  fetchOnchainVaultSummary,
  requestOnchainBobAdvance,
  type OnchainEmployee,
  type OnchainVaultSummary,
} from "../lib/api";

export default function HomeScreen() {
  const [vault, setVault] = useState<OnchainVaultSummary | null>(null);
  const [bob, setBob] = useState<OnchainEmployee | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData(showLoader = true) {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const [vaultData, bobData] = await Promise.all([
        fetchOnchainVaultSummary(),
        fetchOnchainBob(),
      ]);

      setVault(vaultData);
      setBob(bobData);
    } catch {
      setError("No se pudo cargar la información on-chain.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function handleAdvanceRequest() {
    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const numericAmount = Number(amount);

      if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
        setError("Ingresa un monto válido.");
        return;
      }

      const result = await requestOnchainBobAdvance(numericAmount);

      setMessage(
        `Adelanto enviado. Neto: $${result.request.netAmount}. Fee: $${result.request.feeAmount}.`
      );

      setAmount("");
      await loadData(false);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo solicitar el adelanto on-chain.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={{ color: "#cbd5e1", marginTop: 12 }}>
            Cargando app móvil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && (!vault || !bob)) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
        <View style={{ padding: 24 }}>
          <Text style={{ color: "#fca5a5", fontSize: 16 }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View>
          <Text
            style={{
              color: "#34d399",
              fontSize: 12,
              letterSpacing: 3,
              marginBottom: 8,
            }}
          >
            EMPLOYEE APP
          </Text>
          <Text
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            PayStream
          </Text>
          <Text style={{ color: "#cbd5e1", fontSize: 16 }}>
            Adelanto de nómina on-chain para empleados.
          </Text>
        </View>

        {vault && (
          <View
            style={{
              backgroundColor: "#0f172a",
              borderRadius: 20,
              padding: 18,
              gap: 10,
            }}
          >
            <Text style={{ color: "#94a3b8", fontSize: 13 }}>
              Estado de la vault
            </Text>
            <Text style={{ color: "white", fontSize: 18 }}>
              Ciclo actual: #{vault.currentCycle}
            </Text>
            <Text style={{ color: "white", fontSize: 16 }}>
              Liquidez: ${vault.availableLiquidity.toLocaleString("es-MX")}
            </Text>
            <Text style={{ color: "white", fontSize: 16 }}>
              Fees: ${vault.totalFeesCollected.toLocaleString("es-MX")}
            </Text>
          </View>
        )}

        {bob && (
          <View
            style={{
              backgroundColor: "#0f172a",
              borderRadius: 20,
              padding: 18,
              gap: 10,
            }}
          >
            <Text style={{ color: "#94a3b8", fontSize: 13 }}>Empleado</Text>
            <Text style={{ color: "white", fontSize: 26, fontWeight: "700" }}>
              {bob.label}
            </Text>
            <Text style={{ color: "#cbd5e1", fontSize: 15 }}>
              RFC: {bob.rfc}
            </Text>
            <Text style={{ color: "#cbd5e1", fontSize: 15 }}>
              Salario por ciclo: ${bob.salaryPerCycle.toLocaleString("es-MX")}
            </Text>
            <Text style={{ color: "#cbd5e1", fontSize: 15 }}>
              Retirado en ciclo: ${bob.drawnThisCycle.toLocaleString("es-MX")}
            </Text>
            <Text
              style={{
                color: "#10b981",
                fontSize: 20,
                fontWeight: "700",
                marginTop: 6,
              }}
            >
              Disponible: ${bob.availableAdvance.toLocaleString("es-MX")}
            </Text>
          </View>
        )}

        <View
          style={{
            backgroundColor: "#0f172a",
            borderRadius: 20,
            padding: 18,
            gap: 14,
          }}
        >
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
            Solicitar adelanto
          </Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Monto"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            style={{
              backgroundColor: "#020617",
              color: "white",
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 14,
              borderWidth: 1,
              borderColor: "#334155",
            }}
          />

          {error ? (
            <View
              style={{
                backgroundColor: "rgba(239,68,68,0.12)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <Text style={{ color: "#fca5a5" }}>{error}</Text>
            </View>
          ) : null}

          {message ? (
            <View
              style={{
                backgroundColor: "rgba(16,185,129,0.12)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <Text style={{ color: "#6ee7b7" }}>{message}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleAdvanceRequest}
            disabled={submitting}
            style={{
              backgroundColor: submitting ? "#059669" : "#10b981",
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: "#022c22", fontSize: 16, fontWeight: "700" }}
            >
              {submitting ? "Enviando..." : "Solicitar adelanto on-chain"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
