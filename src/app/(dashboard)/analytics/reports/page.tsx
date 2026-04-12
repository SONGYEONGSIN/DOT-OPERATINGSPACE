import { PageHeader } from "@/components/common";
import DocumentTabs from "./DocumentTabs";

export default function DocumentsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="문서작성"
        description="경위서, 견적서 등 운영 문서를 작성하고 Word 파일로 다운로드하세요."
        breadcrumb={["분석 & 보고", "문서작성"]}
      />
      <DocumentTabs />
    </div>
  );
}
