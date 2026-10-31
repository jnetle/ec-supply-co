import type { AboutBlock, AboutText } from "@/lib/content/calendar";

import styles from "./event-about.module.css";

/**
 * An event's About section from Wix, as text only. Images and other media
 * were already dropped when the event was read (see `aboutBlocks`).
 */
export function EventAbout({
  blocks,
  className = "",
}: {
  blocks: AboutBlock[];
  className?: string;
}) {
  return (
    <div className={`${styles.about} ${className}`}>
      {blocks.map((block, i) => {
        if (block.kind === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={i}>
              {block.items.map((item, j) => (
                <li key={j}>
                  <Runs runs={item} />
                </li>
              ))}
            </List>
          );
        }
        const Block = block.kind === "heading" ? "h3" : "p";
        return (
          <Block key={i}>
            <Runs runs={block.content} />
          </Block>
        );
      })}
    </div>
  );
}

function Runs({ runs }: { runs: AboutText[] }) {
  return runs.map((run, i) => {
    let node: React.ReactNode = run.text;
    if (run.bold) node = <strong>{node}</strong>;
    if (run.italic) node = <em>{node}</em>;
    if (run.href) {
      node = (
        <a href={run.href} target="_blank" rel="noopener noreferrer">
          {node}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      );
    }
    return <span key={i}>{node}</span>;
  });
}
