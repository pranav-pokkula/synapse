import { sampleSnapshot } from "@/lib/sample";
import { Studio } from "@/components/studio";
export default function LearnPage() {
  return <Studio sample={sampleSnapshot()} />;
}
