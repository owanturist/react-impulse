function toConcise<TEntry, TConcise>(
  entries: ReadonlyArray<TEntry | TConcise>,
  isConcise: (entry: TEntry | TConcise) => entry is TConcise,
  fallback: TConcise,
): TConcise | ReadonlyArray<TEntry | TConcise>

function toConcise<TEntry, TConcise, TVerbose>(
  entries: ReadonlyArray<TEntry | TConcise>,
  isConcise: (entry: TEntry | TConcise) => entry is TConcise,
  fallback: TConcise,
  verbose: TVerbose,
): TConcise | TVerbose

function toConcise<TEntry, TConcise, TVerbose>(
  entries: ReadonlyArray<TEntry | TConcise>,
  isConcise: (entry: TEntry | TConcise) => entry is TConcise,
  fallback: TConcise,
  verbose?: TVerbose,
): TConcise | ReadonlyArray<TEntry | TConcise> | TVerbose {
  const concise = entries.find(isConcise) ?? fallback

  for (const entry of entries) {
    if (entry !== concise) {
      return verbose ?? entries
    }
  }

  return concise
}

export { toConcise }
