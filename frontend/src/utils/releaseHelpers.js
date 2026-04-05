export const formatReleaseHeading = (dateString) => {
  const releaseDate = new Date(`${dateString}T00:00:00`);
  const today = new Date();

  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const releaseOnly = new Date(
    releaseDate.getFullYear(),
    releaseDate.getMonth(),
    releaseDate.getDate()
  );

  const diffTime = releaseOnly - todayOnly;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const weekday = releaseDate.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = releaseDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (diffDays === 0) return `Today, ${formattedDate}`;
  if (diffDays === 1) return `Tomorrow, ${formattedDate}`;
  if (diffDays > 1 && diffDays < 7) return `This ${weekday}, ${formattedDate}`;

  return `${weekday}, ${formattedDate}`;
};

export const getUpcomingReleases = (releases) => {
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return releases
    .filter((release) => {
      const releaseDate = new Date(`${release.releaseDate}T00:00:00`);
      const releaseOnly = new Date(
        releaseDate.getFullYear(),
        releaseDate.getMonth(),
        releaseDate.getDate()
      );
      return releaseOnly >= todayOnly;
    })
    .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
};

export const groupReleasesByDate = (releases) => {
  return releases.reduce((groups, release) => {
    const date = release.releaseDate;

    if (!groups[date]) {
      groups[date] = [];
    }

    groups[date].push(release);
    return groups;
  }, {});
};










// Archive Section

export const getPastReleases = (releases) => {
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return releases
    .filter((release) => {
      const releaseDate = new Date(`${release.releaseDate}T00:00:00`);
      const releaseOnly = new Date(
        releaseDate.getFullYear(),
        releaseDate.getMonth(),
        releaseDate.getDate()
      );
      return releaseOnly < todayOnly;
    })
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
};
