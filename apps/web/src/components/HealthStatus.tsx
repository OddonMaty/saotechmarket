import React from 'react';
import type { HealthResponse } from '@saotech/shared';
import type { Dictionary } from '../i18n';

interface HealthStatusProps {
  health: HealthResponse | null;
  dict: Dictionary;
}

export function HealthStatus({ health, dict }: HealthStatusProps) {
  const isOk = health?.status === 'ok';

  return (
    <section className="py-12 bg-light border-y border-border">
      <div className="container">
        <div className="max-w-2xl mx-auto bg-surface border border-border rounded p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <div className="flex items-center gap-3">
              <span
                className={`w-3.5 h-3.5 rounded-full inline-block ${
                  isOk ? 'bg-success animate-pulse' : 'bg-danger'
                }`}
              />
              <h2 className="font-condensed text-xl font-bold uppercase text-dark">
                {dict.health.title}
              </h2>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded uppercase ${
                isOk
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {isOk ? dict.health.statusOk : dict.health.statusError}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-text-muted font-medium mb-1">
                {dict.health.service}
              </p>
              <p className="font-mono font-bold text-dark">
                {health?.service || 'saotech-api'}
              </p>
            </div>
            <div>
              <p className="text-text-muted font-medium mb-1">
                {dict.health.version}
              </p>
              <p className="font-mono font-bold text-dark">
                {health?.version || '0.1.0'}
              </p>
            </div>
            <div>
              <p className="text-text-muted font-medium mb-1">
                {dict.health.uptime}
              </p>
              <p className="font-mono font-bold text-dark">
                {health ? `${Math.floor(health.uptime)}s` : '—'}
              </p>
            </div>
            <div>
              <p className="text-text-muted font-medium mb-1">
                {dict.health.checkedAt}
              </p>
              <p className="font-mono text-dark truncate">
                {health ? new Date(health.timestamp).toLocaleTimeString('fr-FR') : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

