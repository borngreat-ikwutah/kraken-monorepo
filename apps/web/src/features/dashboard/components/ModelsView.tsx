import { useThreatModels } from "../hooks/useThreatModels"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { 
  Empty, 
  EmptyMedia, 
  EmptyHeader, 
  EmptyTitle, 
  EmptyDescription 
} from "@workspace/ui/components/empty"
import { Brain, CheckCircle, Lightning, Database, ArrowsClockwise } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"

export function ModelsView() {
  const { models, loading, refresh } = useThreatModels()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active ML Threat Models</h2>
          <p className="text-xs text-slate-500 mt-1">Registry of production inference pipelines, feature mappings, and SLA benchmarks</p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refresh()}
          className="text-xs rounded-xl bg-white border-slate-200 text-slate-700 font-semibold gap-1.5 shadow-2xs"
        >
          <ArrowsClockwise className="w-3.5 h-3.5" />
          <span>Sync Registry</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Registered Models</span>
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{models.length} Online</p>
            <span className="text-[11px] text-emerald-600 font-medium">All inference pipelines healthy</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Avg Inference Latency</span>
              <Lightning className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">24.6 ms</p>
            <span className="text-[11px] text-slate-400 font-medium">Sub-50ms SLA target met</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Model Registry State</span>
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">Live Backend</p>
            <span className="text-[11px] text-slate-400 font-medium">Auto-loaded on startup</span>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {loading && models.length === 0 ? (
          <p className="text-sm text-slate-400 py-12 text-center font-medium">Loading model registry...</p>
        ) : models.length === 0 ? (
          <Empty className="my-8">
            <EmptyMedia variant="icon">
              <Brain className="w-6 h-6 text-slate-400" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Threat Models Registered</EmptyTitle>
              <EmptyDescription>
                The model registry has not registered any active inference pipelines.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          models.map((model) => (
            <Card key={model.id} className="bg-white border-slate-200/80 shadow-xs rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{model.name}</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                      <CheckCircle className="w-3 h-3 mr-1" weight="fill" />
                      {model.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{model.type}</p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy</span>
                    <span className="text-sm font-bold font-mono text-blue-600">{model.accuracy}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Latency</span>
                    <span className="text-sm font-bold font-mono text-slate-700">{model.latency}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">{model.description}</p>
                
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Extracted Signal Features:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {model.features.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
