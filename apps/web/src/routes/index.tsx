import { useState, useEffect } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"

export const Route = createFileRoute("/")({ component: App })

function App() {
  const [apiResponse, setApiResponse] = useState<string>("Testing connection...")

  const fetchBackend = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/health")
      const data = await res.json()
      setApiResponse(data.message || JSON.stringify(data))
    } catch (err) {
      setApiResponse("Could not connect to Flask backend (is it running on :5000?)")
    }
  }

  useEffect(() => {
    fetchBackend()
  }, [])

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium text-lg">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <Button className="mt-2" onClick={fetchBackend}>Check Flask Backend Status</Button>
          <div className="mt-4 p-3 rounded bg-muted text-xs font-mono">
            <strong>Backend Status:</strong> {apiResponse}
          </div>
        </div>
      </div>
    </div>
  )
}

