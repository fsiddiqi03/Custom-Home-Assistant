/**
 * System Page
 * Pi monitoring stats (Phase 6)
 */

export default function SystemPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          System Health
        </h1>
        <p className="text-foreground/60">
          Monitor your Raspberry Pi devices
        </p>
      </div>

      {/* Pi Stats Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pi1 */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Pi 1 - Camera Server
          </h2>
          <div className="space-y-4">
            {["CPU", "RAM", "Disk", "Temp"].map((metric) => (
              <div key={metric}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground/80">{metric}</span>
                  <span className="text-foreground/60">-- %</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-primary/30 w-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pi2 */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Pi 2 - HomeAPI
          </h2>
          <div className="space-y-4">
            {["CPU", "RAM", "Disk", "Temp"].map((metric) => (
              <div key={metric}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground/80">{metric}</span>
                  <span className="text-foreground/60">-- %</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-primary/30 w-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-4">
        <p className="text-foreground/80 text-sm">
          Phase 6: System stats will auto-refresh every 15-30 seconds
        </p>
      </div>
    </div>
  );
}
