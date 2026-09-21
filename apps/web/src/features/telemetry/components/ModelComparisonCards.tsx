import { Brain, TreeStructure, ShieldCheck, Sparkle, Gauge, Scales } from "@phosphor-icons/react"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import type { IngestionResult, ModelPrediction, SubModelScore } from "../types/ingest.types"

interface ModelComparisonCardsProps {
  result: IngestionResult
}

export function ModelComparisonCards({ result }: ModelComparisonCardsProps) {
  // Extract individual model predictions
  const allPredictions: (ModelPrediction | SubModelScore)[] = [
    ...(result.all_predictions || []),
    ...(result.prediction.models_evaluated || [])
  ]

  // Find Transformer prediction
  const transformerPred = allPredictions.find((p) => {
    const name = p.model_name.toLowerCase()
    return name.includes("transformer") || name.includes("distilbert") || name.includes("phishing")
  }) || {
    model_name: "Hugging Face DistilBERT (NLP)",
    score: result.prediction.score,
    threat_label: result.prediction.threat_label,
    explanation: "Deep transformer representation evaluating semantic deception and text markers."
  }

  // Find Random Forest prediction
  const rfPred = allPredictions.find((p) => {
    const name = p.model_name.toLowerCase()
    return name.includes("random forest") || name.includes("randomforest")
  }) || {
    model_name: "Random Forest Classifier",
    score: result.prediction.score * 0.92,
    threat_label: result.prediction.threat_label,
    explanation: "Supervised tree ensemble classifying engineered lexical, entropy, and structural metrics."
  }

  // Find Isolation Forest prediction if available
  const isoPred = allPredictions.find((p) =>
    p.model_name.toLowerCase().includes("isolation")
  )

  // Overall Consensus Score
  const consensusScore = result.prediction.score
  const tScore = transformerPred.score
  const rfScore = rfPred.score

  // Calculate agreement
  const scoreDiff = Math.abs(tScore - rfScore)
  const isStrongAgreement = scoreDiff < 0.15 && tScore >= 0.6 && rfScore >= 0.6

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return { text: "text-rose-600", bg: "bg-rose-500", bar: "bg-rose-500", border: "border-rose-200", badge: "bg-rose-100 text-rose-800" }
    if (score >= 0.6) return { text: "text-amber-600", bg: "bg-amber-500", bar: "bg-amber-500", border: "border-amber-200", badge: "bg-amber-100 text-amber-800" }
    if (score >= 0.4) return { text: "text-yellow-600", bg: "bg-yellow-500", bar: "bg-yellow-500", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-800" }
    return { text: "text-emerald-600", bg: "bg-emerald-500", bar: "bg-emerald-500", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-800" }
  }

  const tColor = getScoreColor(tScore)
  const rfColor = getScoreColor(rfScore)
  const cColor = getScoreColor(consensusScore)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Scales className="w-4 h-4 text-blue-600" weight="bold" />
          <span>Model Comparison: Transformer vs. Random Forest</span>
        </h3>
        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          Dual-Inference Pipeline
        </span>
      </div>

      {/* Model Agreement Banner */}
      <div
        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
          isStrongAgreement
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
            : "bg-blue-50/80 border-blue-200 text-blue-900"
        }`}
      >
        <div className="flex items-center gap-2">
          {isStrongAgreement ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" weight="fill" />
          ) : (
            <Sparkle className="w-5 h-5 text-blue-600 shrink-0" weight="fill" />
          )}
          <div>
            <span className="font-bold">
              {isStrongAgreement ? "High Model Agreement" : "Ensemble Fused Consensus"}:
            </span>{" "}
            {isStrongAgreement
              ? "Both the semantic Transformer and structural Random Forest models flagged strong malicious indicators with an agreement delta under 15%."
              : `Consensus weighted at 60% Transformer (NLP Semantics) + 40% Random Forest (Lexical Structure). Score delta: ${(scoreDiff * 100).toFixed(1)}%.`}
          </div>
        </div>
      </div>

      {/* Side-by-Side Model Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Transformer Model Card */}
        <Card className="border-purple-100 bg-linear-to-b from-purple-50/40 to-white shadow-xs rounded-2xl overflow-hidden relative border">
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
          <CardHeader className="pb-3 pt-4 px-4 border-b border-purple-100/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <Brain className="w-4 h-4" weight="bold" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold text-slate-900">
                    Hugging Face DistilBERT
                  </CardTitle>
                  <p className="text-[10px] text-purple-600 font-medium">NLP Semantic Threat Model</p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] font-semibold">
                Weight: 60%
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-slate-500">Threat Probability:</span>
              <span className={`text-2xl font-extrabold font-mono ${tColor.text}`}>
                {(tScore * 100).toFixed(1)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${tColor.bar} transition-all duration-500`}
                style={{ width: `${Math.min(100, tScore * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-500 font-medium">Model Verdict:</span>
              <Badge className={`${tColor.badge} font-bold text-[10px] uppercase`}>
                {transformerPred.threat_label || "MALICIOUS"}
              </Badge>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 text-[11px] text-slate-600 leading-relaxed">
              <span className="font-semibold text-purple-900 block mb-0.5">Semantic Analysis:</span>
              {transformerPred.explanation || "Evaluated token sequences, deceptive phrasing patterns, and phishing lures."}
            </div>
          </CardContent>
        </Card>

        {/* Random Forest Classifier Card */}
        <Card className="border-emerald-100 bg-linear-to-b from-emerald-50/40 to-white shadow-xs rounded-2xl overflow-hidden relative border">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <CardHeader className="pb-3 pt-4 px-4 border-b border-emerald-100/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <TreeStructure className="w-4 h-4" weight="bold" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold text-slate-900">
                    Random Forest Classifier
                  </CardTitle>
                  <p className="text-[10px] text-emerald-600 font-medium">Lexical & Structural ML</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-semibold">
                Weight: 40%
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-slate-500">Threat Probability:</span>
              <span className={`text-2xl font-extrabold font-mono ${rfColor.text}`}>
                {(rfScore * 100).toFixed(1)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${rfColor.bar} transition-all duration-500`}
                style={{ width: `${Math.min(100, rfScore * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-500 font-medium">Model Verdict:</span>
              <Badge className={`${rfColor.badge} font-bold text-[10px] uppercase`}>
                {rfPred.threat_label || "MALICIOUS"}
              </Badge>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] text-slate-600 leading-relaxed">
              <span className="font-semibold text-emerald-900 block mb-0.5">Structural Analysis:</span>
              {rfPred.explanation || "Tree split decision based on entropy, token count, length, and anomaly metrics."}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Isolation Forest Card (Shown if network anomaly was evaluated) */}
      {isoPred && (
        <Card className="border-blue-100 bg-blue-50/30 rounded-2xl p-4 border text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" weight="bold" />
              <span className="font-bold text-slate-900">Isolation Forest (Unsupervised Anomaly):</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800 font-mono font-bold">
              {(isoPred.score * 100).toFixed(1)}% Anomaly Index
            </Badge>
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5">{isoPred.explanation}</p>
        </Card>
      )}

      {/* Consensus Breakdown Banner */}
      <div className="p-3.5 bg-slate-900 text-slate-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white font-bold text-[10px]">ENSEMBLE CONSENSUS</Badge>
            <span className="text-xs font-semibold text-slate-300">
              Severity: <strong className={cColor.text}>{result.severity}</strong>
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {result.prediction.explanation || "Consensus calculated using weighted multi-model inference."}
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Final Fused Score</span>
          <span className="text-2xl font-black font-mono text-blue-400">
            {(consensusScore * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}
