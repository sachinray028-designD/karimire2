/**
 * Article AEO (Answer Engine Optimisation) utilities.
 *
 * Extracts headings, FAQ pairs, HowTo steps from markdown content
 * to generate structured data for AI answer engines.
 */

/** Slugify a heading string into a valid HTML id. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface HeadingEntry {
  level: number; // 2, 3, or 4
  text: string;
  id: string;
}

/** Extract headings (h2/h3/h4) from markdown source. */
export function extractHeadings(markdown: string): HeadingEntry[] {
  const headings: HeadingEntry[] = [];
  // Match markdown headings: ## Heading, ### Heading, #### Heading
  const regex = /^(#{2,4})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '').trim();
    headings.push({ level, text, id: slugify(text) });
  }
  return headings;
}

export interface FAQPair {
  question: string;
  answer: string;
}

const QUESTION_STARTS = /^(what|how|can|is|are|do|does|should|why|when|where|which|will|would|could)\b/i;

/** Check if a heading is in question form. */
function isQuestion(text: string): boolean {
  return QUESTION_STARTS.test(text) || text.trim().endsWith('?');
}

/**
 * Extract FAQ pairs from markdown.
 * A question heading + everything until the next heading = one FAQ pair.
 */
export function extractFAQPairs(markdown: string): FAQPair[] {
  const pairs: FAQPair[] = [];
  const lines = markdown.split('\n');
  let currentQuestion = '';
  let answerLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{2,4})\s+(.+)$/);
    if (headingMatch) {
      // Flush previous question
      if (currentQuestion && answerLines.length > 0) {
        pairs.push({
          question: currentQuestion,
          answer: answerLines
            .join('\n')
            .replace(/^\s*\n/, '')
            .trim()
            // Strip markdown formatting for schema
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/\[(.*?)\]\(.*?\)/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .substring(0, 2000), // Schema best practice: keep answers concise
        });
      }
      const text = headingMatch[2].replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '').trim();
      if (isQuestion(text)) {
        currentQuestion = text;
        answerLines = [];
      } else {
        currentQuestion = '';
        answerLines = [];
      }
    } else if (currentQuestion) {
      answerLines.push(line);
    }
  }

  // Flush last
  if (currentQuestion && answerLines.length > 0) {
    pairs.push({
      question: currentQuestion,
      answer: answerLines
        .join('\n')
        .replace(/^\s*\n/, '')
        .trim()
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .substring(0, 2000),
    });
  }

  return pairs;
}

export interface HowToStep {
  name: string;
  text: string;
  position: number;
}

const STEP_PATTERN = /^step\s+(\d+)/i;

/**
 * Extract HowTo steps from markdown.
 * Looks for headings like "Step 1: ...", "Step 2: ..."
 */
export function extractHowToSteps(markdown: string): HowToStep[] {
  const steps: HowToStep[] = [];
  const lines = markdown.split('\n');
  let currentStep: { name: string; position: number } | null = null;
  let textLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{2,4})\s+(.+)$/);
    if (headingMatch) {
      // Flush previous step
      if (currentStep && textLines.length > 0) {
        steps.push({
          ...currentStep,
          text: textLines
            .join('\n')
            .trim()
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/\[(.*?)\]\(.*?\)/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .substring(0, 1000),
        });
      }

      const text = headingMatch[2].replace(/\*\*/g, '').replace(/\*/g, '').trim();
      const stepMatch = text.match(STEP_PATTERN);
      if (stepMatch) {
        currentStep = {
          name: text.replace(STEP_PATTERN, '').replace(/^[\s:—–-]+/, '').trim() || text,
          position: parseInt(stepMatch[1], 10),
        };
        textLines = [];
      } else {
        currentStep = null;
        textLines = [];
      }
    } else if (currentStep) {
      textLines.push(line);
    }
  }

  // Flush last
  if (currentStep && textLines.length > 0) {
    steps.push({
      ...currentStep,
      text: textLines
        .join('\n')
        .trim()
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .substring(0, 1000),
    });
  }

  return steps.length >= 2 ? steps : []; // Only emit HowTo with 2+ steps
}

/** Build FAQPage schema from extracted pairs. */
export function buildFAQSchema(pairs: FAQPair[]): object | null {
  if (pairs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pairs.map((p) => ({
      '@type': 'Question',
      name: p.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: p.answer,
      },
    })),
  };
}

/** Build HowTo schema from extracted steps. */
export function buildHowToSchema(
  title: string,
  steps: HowToStep[],
  articleUrl: string
): object | null {
  if (steps.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    url: articleUrl,
    step: steps.map((s) => ({
      '@type': 'HowToStep',
      position: s.position,
      name: s.name,
      text: s.text,
    })),
  };
}

/** Build SpeakableSpecification for BlogPosting. */
export function buildSpeakable(): object {
  return {
    '@type': 'SpeakableSpecification',
    cssSelector: ['article h1', 'article .article-intro'],
  };
}
