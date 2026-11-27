export type DirectoryUser = {
    id: number;
    name: string;
    email: string;
    account_status: string;
    roles: string[];
    created_at: string | null;
};

export type DirectoryFilters = {
    search: string;
    status: string | null;
    role: string | null;
};

export type PaginatedUsers = {
    data: DirectoryUser[];
    total: number;
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type UserDirectoryStats = {
    totalAccounts: number;
    activeAccounts: number;
    suspendedAccounts: number;
};
