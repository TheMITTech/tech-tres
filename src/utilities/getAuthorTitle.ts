export const getAuthorTitle = (
  positions: { from: string; title?: string | null }[] | null | undefined,
  articleDate: string | Date,
): string | undefined => {
  const at = new Date(articleDate).getTime()
  return (
    positions
      ?.filter((p) => new Date(p.from).getTime() <= at)
      .sort((a, b) => new Date(b.from).getTime() - new Date(a.from).getTime())[0]?.title ||
    undefined
  )
}
