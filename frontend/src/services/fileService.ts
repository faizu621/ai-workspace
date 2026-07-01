import axiosInstance from "@/lib/axios";

export interface WorkspaceFile {
  id: string;
  name: string;
  size: string;
  type: string;
  category: "documents" | "images" | "backups" | "code";
  uploadedBy: string;
  uploadedAt: string;
  versions: Array<{
    version: number;
    size: string;
    uploadedBy: string;
    uploadedAt: string;
  }>;
}

const mockFiles: WorkspaceFile[] = [
  {
    id: "file_1",
    name: "System_Architecture_v2.pdf",
    size: "4.8 MB",
    type: "application/pdf",
    category: "documents",
    uploadedBy: "Alex Rivera",
    uploadedAt: "2026-06-25T11:20:00Z",
    versions: [
      { version: 2, size: "4.8 MB", uploadedBy: "Alex Rivera", uploadedAt: "2026-06-25T11:20:00Z" },
      { version: 1, size: "4.5 MB", uploadedBy: "Sarah Chen", uploadedAt: "2026-06-22T09:10:00Z" }
    ]
  },
  {
    id: "file_2",
    name: "logo_gradient_dark.svg",
    size: "45 KB",
    type: "image/svg+xml",
    category: "images",
    uploadedBy: "Sarah Chen",
    uploadedAt: "2026-06-26T15:40:00Z",
    versions: [
      { version: 1, size: "45 KB", uploadedBy: "Sarah Chen", uploadedAt: "2026-06-26T15:40:00Z" }
    ]
  },
  {
    id: "file_3",
    name: "DB_Backup_20260627.sql.gz",
    size: "18.2 MB",
    type: "application/gzip",
    category: "backups",
    uploadedBy: "Marcus Johnson",
    uploadedAt: "2026-06-27T02:00:00Z",
    versions: [
      { version: 1, size: "18.2 MB", uploadedBy: "Marcus Johnson", uploadedAt: "2026-06-27T02:00:00Z" }
    ]
  },
  {
    id: "file_4",
    name: "nginx_config_staging.conf",
    size: "12 KB",
    type: "text/plain",
    category: "code",
    uploadedBy: "Marcus Johnson",
    uploadedAt: "2026-06-24T16:15:00Z",
    versions: [
      { version: 3, size: "12 KB", uploadedBy: "Marcus Johnson", uploadedAt: "2026-06-24T16:15:00Z" },
      { version: 2, size: "11 KB", uploadedBy: "Marcus Johnson", uploadedAt: "2026-06-22T10:00:00Z" },
      { version: 1, size: "9 KB", uploadedBy: "Alex Rivera", uploadedAt: "2026-06-20T14:30:00Z" }
    ]
  }
];

export const fileService = {
  async getFiles(category?: string): Promise<WorkspaceFile[]> {
    await axiosInstance.get("/files", { params: { category } });
    if (category && category !== "all") {
      return mockFiles.filter((f) => f.category === category);
    }
    return mockFiles;
  },

  async uploadFile(name: string, size: string, type: string, category: WorkspaceFile["category"]): Promise<WorkspaceFile> {
    await axiosInstance.post("/files/upload", { name, size, type, category });
    const newFile: WorkspaceFile = {
      id: `file_${Math.random().toString(36).substr(2, 9)}`,
      name,
      size,
      type,
      category,
      uploadedBy: "Alex Rivera",
      uploadedAt: new Date().toISOString(),
      versions: [
        { version: 1, size, uploadedBy: "Alex Rivera", uploadedAt: new Date().toISOString() }
      ]
    };
    mockFiles.unshift(newFile);
    return newFile;
  },

  async deleteFile(id: string): Promise<boolean> {
    await axiosInstance.delete(`/files/${id}`);
    const index = mockFiles.findIndex((f) => f.id === id);
    if (index !== -1) {
      mockFiles.splice(index, 1);
      return true;
    }
    return false;
  }
};
