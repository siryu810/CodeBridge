import { LearnSubNav } from "./LearnSubNav.jsx";
import { LearningRoadmap } from "./LearningRoadmap.jsx";
import { useLearningRoadmap } from "../hooks/useLearningRoadmap.js";

export function LearnRoadmapPage({
    onOpenSample,
    onNavigateLearn,
    onBackEntry,
    onGoSettings,
}) {
    const { chapters, getSampleById } = useLearningRoadmap();

    const handleOpenSampleId = (sampleId) => {
        const sample = getSampleById(sampleId);
        if (sample) onOpenSample?.(sample);
    };

    return (
        <main className="home-view learn-page">
            <LearnSubNav
                activeView="learn-roadmap"
                onNavigate={onNavigateLearn}
                onBackEntry={onBackEntry}
            />
            <section className="panel home-section home-roadmap-panel">
                <LearningRoadmap
                    chapters={chapters}
                    onOpenSample={handleOpenSampleId}
                    onGoSettings={onGoSettings}
                />
            </section>
        </main>
    );
}
