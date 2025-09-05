import type { Project } from "@/types";

type PitchDeckSlidesProps = {
  project: Project;
};

export function PitchDeckSlides({ project }: PitchDeckSlidesProps) {
  return (
    <div className="ppt-container">
      <div className="slide bg-white p-6">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p>{project.description}</p>
      </div>
      <div className="slide bg-white p-6">
        <h2 className="text-xl font-semibold">Key Metrics</h2>
        {/* … charts, stats, badges … */}
      </div>
      {/* more slides */}
    </div>
  );
}
