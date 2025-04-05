import { CosmosNetworkConfig } from "@apophis-sdk/core";
import { Cosmos } from "@apophis-sdk/cosmos";
import { CSSProperties } from "preact/compat";
import { z } from "zod";

export async function getNetworks() {
  return await Promise.all([
    Cosmos.getNetworkFromRegistry('neutrontestnet'),
  ]);
}

export function getNetworkConfigSchema() {
  return z.intersection(
    z.custom<CosmosNetworkConfig>(),
    z.object({
      ecosystem: z.string(),
      name: z.string(),
      chainId: z.string(),
    }),
  ) as z.ZodType<CosmosNetworkConfig>;
}

export const cssvars = (vars: CSSProperties & Record<`--${string}`, string | number>) => vars as CSSProperties;

export function unindent(str: string) {
  const lines = str.split('\n');
  if (lines.length <= 1) return str;

  // first line could be already unindented
  const offset = /^\s+/.test(lines[0]) ? 0 : 1

  const minIndent = lines
    .slice(offset)
    .filter(line => line.trim().length > 0)
    .reduce((min, line) => {
      const indent = line.match(/^\s*/)?.[0].length ?? 0;
      return Math.min(min, indent);
    }, Infinity);

  return lines
    .map(line => line.slice(minIndent))
    .join('\n');
}
