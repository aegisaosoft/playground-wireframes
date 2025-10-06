// Shared search logic for experiences
export const searchExperiences = (query: string, experiences: any[]) => {
  if (!query.trim()) {
    return experiences;
  }

  // Search matches title, location, description, category, or host name
  return experiences.filter(exp => 
    exp.title.toLowerCase().includes(query.toLowerCase()) ||
    exp.location.toLowerCase().includes(query.toLowerCase()) ||
    exp.description.toLowerCase().includes(query.toLowerCase()) ||
    exp.category.toLowerCase().includes(query.toLowerCase()) ||
    exp.host.name.toLowerCase().includes(query.toLowerCase())
  );
};
