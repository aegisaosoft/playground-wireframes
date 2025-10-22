import { useEffect, useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userService, UserProfile, UserSearchResult } from "@/services/user.service";
import { Input } from "@/components/ui/input";
import { brandsService } from "@/services/brands.service";
import { MembersListModal } from "@/components/MembersListModal";
import { experiencesService, Experience } from "@/services/experiences.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Users as UsersIcon, Building, ArrowLeft, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings = () => {
  const [section, setSection] = useState<'users' | 'brands' | 'hosts' | 'payments'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string; ownerId: string; ownerName: string; ownerEmail: string }>>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [hostSearchResults, setHostSearchResults] = useState<UserSearchResult[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedBrandForMembers, setSelectedBrandForMembers] = useState<{ id: string; name: string } | null>(null);
  const [hostCounts, setHostCounts] = useState<Record<string, number>>({});
  const [allExperiences, setAllExperiences] = useState<Experience[]>([]);
  const [showHostExperiencesModal, setShowHostExperiencesModal] = useState(false);
  const [selectedHostForExperiences, setSelectedHostForExperiences] = useState<{ id: string; name: string } | null>(null);
  const [experienceSearchTerm, setExperienceSearchTerm] = useState("");
  const [paymentsFrom, setPaymentsFrom] = useState("");
  const [paymentsTo, setPaymentsTo] = useState("");
  const [paymentsHostId, setPaymentsHostId] = useState<string>("");
  const [paymentsHostName, setPaymentsHostName] = useState<string>("");
  const [paymentsHostPickerOpen, setPaymentsHostPickerOpen] = useState(false);
  const [paymentsHostSearch, setPaymentsHostSearch] = useState("");
  const [paymentsExperienceId, setPaymentsExperienceId] = useState<string>("");
  const [paymentsExperienceName, setPaymentsExperienceName] = useState<string>("");
  const [paymentsExperiencePickerOpen, setPaymentsExperiencePickerOpen] = useState(false);
  const [paymentsExperienceSearch, setPaymentsExperienceSearch] = useState("");

  const computePreviousWeekRange = () => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const now = new Date();
    const currentSunday = new Date(now);
    currentSunday.setHours(0, 0, 0, 0);
    currentSunday.setDate(now.getDate() - now.getDay()); // 0=Sunday
    const prevSunday = new Date(currentSunday);
    prevSunday.setDate(currentSunday.getDate() - 7);
    const prevSaturday = new Date(prevSunday);
    prevSaturday.setDate(prevSunday.getDate() + 6);
    return { from: fmt(prevSunday), to: fmt(prevSaturday) };
  };

  useEffect(() => {
    if (section === 'payments' && (!paymentsFrom || !paymentsTo)) {
      const { from, to } = computePreviousWeekRange();
      setPaymentsFrom(from);
      setPaymentsTo(to);
    }
  }, [section]);
  const PAGE_SIZE = 10;
  const [usersPage, setUsersPage] = useState(1);
  const [brandsPage, setBrandsPage] = useState(1);
  const [hostsPage, setHostsPage] = useState(1);

  useEffect(() => {
    document.title = "Settings";
  }, []);

  useEffect(() => {
    if (section === 'users' && users.length === 0 && !loadingUsers) {
      setLoadingUsers(true);
      userService.getAllUsers()
        .then(list => setUsers(list))
        .finally(() => setLoadingUsers(false));
    }
    if (section === 'brands' && brands.length === 0 && !loadingBrands) {
      setLoadingBrands(true);
      brandsService.getAllBrands()
        .then(list => setBrands(list))
        .finally(() => setLoadingBrands(false));
    }
  }, [section, users.length, loadingUsers, brands.length, loadingBrands]);

  // Ensure data present for Hosts tab
  useEffect(() => {
    if (section !== 'hosts' && section !== 'payments') return;
    if (users.length === 0 && !loadingUsers) {
      setLoadingUsers(true);
      userService.getAllUsers()
        .then(list => setUsers(list))
        .finally(() => setLoadingUsers(false));
    }
    if (brands.length === 0 && !loadingBrands) {
      setLoadingBrands(true);
      brandsService.getAllBrands()
        .then(list => setBrands(list))
        .finally(() => setLoadingBrands(false));
    }
  }, [section]);

  // Reset pagination on search changes
  useEffect(() => { setUsersPage(1); }, [searchTerm]);
  useEffect(() => { setBrandsPage(1); setHostsPage(1); }, [brandSearchTerm]);

  // Export helpers
  const exportToExcel = (rows: Array<Record<string, any>>, filename: string) => {
    try {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch {}
  };

  const exportToPdf = (columns: string[], rows: any[][], filename: string) => {
    try {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [columns],
        body: rows,
        styles: { 
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 20 },
      });
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  // Users table (React Table v8): columns and data (top-level hooks, stable order)
  const usersFiltered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return q.length >= 2
      ? users.filter(u => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q))
      : users;
  }, [users, searchTerm]);

  type UserRow = typeof usersFiltered[number];
  const usersColumns = useMemo<ColumnDef<UserRow>[]>(() => [
    {
      header: 'User',
      cell: ({ row }) => {
        const u = row.original as any;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={u.profileImageUrl} />
              <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan">
                {u.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground font-medium">{u.name}</span>
          </div>
        );
      }
    },
    { header: 'Email', accessorKey: 'email' as any },
    {
      header: 'Role',
      cell: ({ row }) => {
        const u = row.original as any;
        return (
          <select
            value={u.role}
            onChange={async (e) => {
              const newRole = e.target.value;
              try {
                await userService.changeUserRole(u.id, newRole);
                setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x));
              } catch {}
            }}
            className="bg-black/30 text-foreground border border-white/20 rounded px-2 py-1"
          >
            <option value="user" style={{ color: '#000' }}>user</option>
            <option value="host" style={{ color: '#000' }}>host</option>
            <option value="admin" style={{ color: '#000' }}>admin</option>
          </select>
        );
      }
    },
    {
      header: 'Verification',
      cell: ({ row }) => {
        const u = row.original as any;
        return (
          <button
            onClick={async () => {
              try {
                await userService.forceVerifyEmail(u.id);
                setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isEmailVerified: true } : x));
              } catch {}
            }}
            className={`px-2 py-1 rounded border ${u.isEmailVerified ? 'bg-neon-green/20 text-neon-green border-neon-green/40' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'}`}
            title={u.isEmailVerified ? 'Verified' : 'Mark as Verified'}
          >
            {u.isEmailVerified ? 'Verified' : 'Verify'}
          </button>
        );
      }
    }
  ], [setUsers]);

  const usersTable = useReactTable({
    data: usersFiltered as any[],
    columns: usersColumns as any[],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination: { pageIndex: Math.max(0, usersPage - 1), pageSize: PAGE_SIZE } },
    onPaginationChange: (updater: any) => {
      const next = typeof updater === 'function' ? updater({ pageIndex: Math.max(0, usersPage - 1), pageSize: PAGE_SIZE }) : updater;
      if (typeof next?.pageIndex === 'number') setUsersPage(next.pageIndex + 1);
    },
  });

  // Load experience counts by host (user or brand) for Hosts tab
  useEffect(() => {
    if (section !== 'hosts') return;
    (async () => {
      try {
        const list = await experiencesService.getAll();
        const counts: Record<string, number> = {};
        for (const exp of list) {
          const hid = (exp.hostId || '').toLowerCase();
          if (!hid) continue;
          counts[hid] = (counts[hid] || 0) + 1;
        }
        setHostCounts(counts);
        setAllExperiences(list);
      } catch {
        setHostCounts({});
        setAllExperiences([]);
      }
    })();
  }, [section]);

  // Debounced host search (users)
  useEffect(() => {
    if (section !== 'hosts') return;
    const q = brandSearchTerm.trim();
    if (q.length < 2) {
      setHostSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const results = await userService.searchUsers(q);
        setHostSearchResults(results || []);
      } catch {
        setHostSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [brandSearchTerm, section]);

  // Debounced user search
  useEffect(() => {
    if (section !== 'users') return;
    const q = searchTerm.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const t = setTimeout(async () => {
      try {
        const results = await userService.searchUsers(q);
        setSearchResults(results || []);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, section]);

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/experiences" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Experiences
            </Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-3">
        <Separator className="my-1" />

      <div className="lg:flex lg:gap-8">
        {/* Left column: section info */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-4">
              <div>
                <div className="text-sm uppercase tracking-wider text-muted-foreground">Admin Settings</div>
              </div>

              {/* Vertical nav like Account page */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className={`w-full flex justify-start items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    section === 'users'
                      ? 'bg-gradient-neon text-background shadow-neon'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                  onClick={() => setSection('users')}
                >
                  <UsersIcon className="w-5 h-5" />
                  <span>Users</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border mt-4">
            <CardContent className="p-5 space-y-4">
              <div>
                <div className="text-sm uppercase tracking-wider text-muted-foreground">Reports</div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className={`w-full flex justify-start items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    section === 'brands'
                      ? 'bg-gradient-neon text-background shadow-neon'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                  onClick={() => setSection('brands')}
                >
                  <Building className="w-5 h-5" />
                  <span>Brands</span>
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full flex justify-start items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    section === 'hosts'
                      ? 'bg-gradient-neon text-background shadow-neon'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                  onClick={() => setSection('hosts')}
                >
                  <UsersIcon className="w-5 h-5" />
                  <span>Hosts</span>
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full flex justify-start items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    section === 'payments'
                      ? 'bg-gradient-neon text-background shadow-neon'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                  onClick={() => setSection('payments')}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Payments</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: content */}
        <div className="flex-1 lg:max-w-none">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              {section === 'users' ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Users</h2>
                  <div className="flex items-center gap-3">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Find user by name or email"
                      className="max-w-md"
                    />
                    {isSearching && <span className="text-sm text-muted-foreground">Searching...</span>}
                  </div>
                  {searchTerm.trim().length >= 2 && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Search results</div>
                      <div className="divide-y divide-white/10">
                        {searchResults.map(u => (
                          <div key={u.id} className="py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={(u as any).avatarUrl || (u as any).avatar} />
                                <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan">
                                  {u.name?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-foreground font-medium">{u.name}</div>
                                <div className="text-sm text-muted-foreground">{u.email}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {!isSearching && searchResults.length === 0 && (
                          <div className="text-muted-foreground">No matching users.</div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-foreground hover:bg-white/10"
                      onClick={() => {
                        const rows = usersFiltered.map(u => ({
                          Name: u.name,
                          Email: u.email,
                          Role: u.role,
                          Verified: u.isEmailVerified ? 'Yes' : 'No'
                        }));
                        exportToExcel(rows as any, 'users');
                      }}
                    >
                      Export Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-foreground hover:bg-white/10"
                      onClick={() => {
                        const cols = ['Name','Email','Role','Verified'];
                        const rows = usersFiltered.map(u => [u.name, u.email, u.role, u.isEmailVerified ? 'Yes' : 'No']);
                        exportToPdf(cols, rows as any, 'users');
                      }}
                    >
                      Export PDF
                    </Button>
                  </div>
                  {loadingUsers ? (
                    <div className="text-muted-foreground">Loading users...</div>
                  ) : (
                    <div className="space-y-3">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            {usersTable.getHeaderGroups().map(hg => (
                              <tr key={hg.id} className="text-left text-muted-foreground border-b border-white/10">
                                {hg.headers.map(h => (
                                  <th key={h.id} className="py-2 pr-4">
                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                  </th>
                                ))}
                              </tr>
                            ))}
                          </thead>
                          <tbody>
                            {usersTable.getRowModel().rows.map(r => (
                              <tr key={r.id} className="border-b border-white/5">
                                {r.getVisibleCells().map(c => (
                                  <td key={c.id} className="py-2 pr-4">
                                    {flexRender(c.column.columnDef.cell, c.getContext())}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {usersFiltered.length === 0 && (
                          <div className="text-muted-foreground">No users found.</div>
                        )}
                      </div>
                      {usersTable.getPageCount() > 1 && (
                        <div className="flex items-center justify-end gap-2 text-sm">
                          <button
                            className="px-2 py-1 border border-white/20 rounded disabled:opacity-50"
                            disabled={!usersTable.getCanPreviousPage()}
                            onClick={() => usersTable.previousPage()}
                          >
                            Prev
                          </button>
                          <span className="text-muted-foreground">Page {usersPage} of {usersTable.getPageCount()}</span>
                          <button
                            className="px-2 py-1 border border-white/20 rounded disabled:opacity-50"
                            disabled={!usersTable.getCanNextPage()}
                            onClick={() => usersTable.nextPage()}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : section === 'brands' ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Brands</h2>
                  <div className="flex items-center gap-3">
                    <Input
                      value={brandSearchTerm}
                      onChange={(e) => setBrandSearchTerm(e.target.value)}
                      placeholder="Find brand by name or owner"
                      className="max-w-md"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-foreground hover:bg-white/10"
                      onClick={() => {
                        const q = brandSearchTerm.trim().toLowerCase();
                        const filtered = q.length >= 2
                          ? brands.filter(b => (b.name || '').toLowerCase().includes(q) || (b.ownerName || '').toLowerCase().includes(q) || (b.ownerEmail || '').toLowerCase().includes(q))
                          : brands;
                        const rows = filtered.map(b => ({
                          Name: b.name,
                          Owner: b.ownerName || b.ownerEmail,
                          Members: (b as any).membersCount ?? '-'
                        }));
                        exportToExcel(rows as any, 'brands');
                      }}
                    >
                      Export Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-foreground hover:bg-white/10"
                      onClick={() => {
                        const q = brandSearchTerm.trim().toLowerCase();
                        const filtered = q.length >= 2
                          ? brands.filter(b => (b.name || '').toLowerCase().includes(q) || (b.ownerName || '').toLowerCase().includes(q) || (b.ownerEmail || '').toLowerCase().includes(q))
                          : brands;
                        const cols = ['Name','Owner','Members'];
                        const rows = filtered.map(b => [b.name, b.ownerName || b.ownerEmail, (b as any).membersCount ?? '-']);
                        exportToPdf(cols, rows as any, 'brands');
                      }}
                    >
                      Export PDF
                    </Button>
                  </div>
                  {loadingBrands ? (
                    <div className="text-muted-foreground">Loading brands...</div>
                  ) : (
                    (() => {
                      const q = brandSearchTerm.trim().toLowerCase();
                      const filtered = q.length >= 2
                        ? brands.filter(b => (b.name || '').toLowerCase().includes(q) || (b.ownerName || '').toLowerCase().includes(q) || (b.ownerEmail || '').toLowerCase().includes(q))
                        : brands;
                      const total = filtered.length;
                      const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
                      const current = Math.min(brandsPage, pageCount);
                      const start = (current - 1) * PAGE_SIZE;
                      const slice = filtered.slice(start, start + PAGE_SIZE);
                      return (
                        <div className="space-y-3">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-muted-foreground border-b border-white/10">
                                  <th className="py-2 pr-4">Brand</th>
                                  <th className="py-2 pr-4">Owner</th>
                                  <th className="py-2 pr-4">Members</th>
                                  <th className="py-2 pr-4">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {slice.map(b => (
                                  <tr key={b.id} className="border-b border-white/5">
                                    <td className="py-2 pr-4 text-foreground font-medium">{b.name}</td>
                                    <td className="py-2 pr-4 text-muted-foreground">{b.ownerName || b.ownerEmail}</td>
                                    <td className="py-2 pr-4 text-muted-foreground">{(b as any).membersCount ?? '-'}</td>
                                    <td className="py-2 pr-4">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-white/20 text-foreground hover:bg-white/10"
                                        onClick={() => { setSelectedBrandForMembers({ id: b.id, name: b.name }); setShowMembersModal(true); }}
                                      >
                                        Show Members
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {total === 0 && (
                              <div className="text-muted-foreground">No brands found.</div>
                            )}
                          </div>
                          {pageCount > 1 && (
                            <div className="flex items-center justify-end gap-2 text-sm">
                              <button
                                className="px-2 py-1 border border-white/20 rounded disabled:opacity-50"
                                disabled={current === 1}
                                onClick={() => setBrandsPage(p => Math.max(1, p - 1))}
                              >
                                Prev
                              </button>
                              <span className="text-muted-foreground">Page {current} of {pageCount}</span>
                              <button
                                className="px-2 py-1 border border-white/20 rounded disabled:opacity-50"
                                disabled={current === pageCount}
                                onClick={() => setBrandsPage(p => Math.min(pageCount, p + 1))}
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              ) : section === 'hosts' ? (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">Hosts</h2>
                  <div className="flex items-center gap-3">
                    <Input
                      value={brandSearchTerm}
                      onChange={(e) => setBrandSearchTerm(e.target.value)}
                      placeholder="Find host by brand, name or email"
                      className="max-w-md"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-foreground hover:bg-white/10"
                      onClick={() => {
                        const lower = brandSearchTerm.toLowerCase();
                        const hostUsers = users.filter(u => /^(host|admin)$/i.test(u.role));
                        const brandItems = brands.map(b => ({ key: `brand-${b.id}`, kind: 'brand' as const, id: b.id, title: b.name, subtitle: `Owner: ${b.ownerName || b.ownerEmail}` }));
                        const userItems = hostUsers.map(u => ({ key: `user-${u.id}`, kind: 'user' as const, id: u.id, title: u.name, subtitle: u.email }));
                        let merged = [...brandItems, ...userItems];
                        if (brandSearchTerm.trim().length >= 2) {
                          merged = merged.filter(i => (i.title || '').toLowerCase().includes(lower) || (i.subtitle || '').toLowerCase().includes(lower));
                        }
                        const rows = merged.map(i => ({ Name: i.title, Info: i.subtitle, Experiences: hostCounts[(i as any).id?.toLowerCase?.() || ''] ?? 0 }));
                        exportToExcel(rows as any, 'hosts');
                      }}
                    >
                      Export Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-foreground hover:bg-white/10"
                      onClick={() => {
                        const lower = brandSearchTerm.toLowerCase();
                        const hostUsers = users.filter(u => /^(host|admin)$/i.test(u.role));
                        const brandItems = brands.map(b => ({ key: `brand-${b.id}`, kind: 'brand' as const, id: b.id, title: b.name, subtitle: `Owner: ${b.ownerName || b.ownerEmail}` }));
                        const userItems = hostUsers.map(u => ({ key: `user-${u.id}`, kind: 'user' as const, id: u.id, title: u.name, subtitle: u.email }));
                        let merged = [...brandItems, ...userItems];
                        if (brandSearchTerm.trim().length >= 2) {
                          merged = merged.filter(i => (i.title || '').toLowerCase().includes(lower) || (i.subtitle || '').toLowerCase().includes(lower));
                        }
                        const cols = ['Name','Info','Experiences'];
                        const rows = merged.map(i => [i.title, i.subtitle, hostCounts[(i as any).id?.toLowerCase?.() || ''] ?? 0]);
                        exportToPdf(cols, rows as any, 'hosts');
                      }}
                    >
                      Export PDF
                    </Button>
                  </div>
                  {loadingBrands && loadingUsers ? (
                    <div className="text-muted-foreground">Loading hosts...</div>
                  ) : (
                    (() => {
                      const lower = brandSearchTerm.toLowerCase();
                      const hostUsers = users.filter(u => /^(host|admin)$/i.test(u.role));
                      const brandItems = brands.map(b => ({
                        key: `brand-${b.id}`,
                        kind: 'brand' as const,
                        id: b.id,
                        title: b.name,
                        subtitle: `Owner: ${b.ownerName || b.ownerEmail}`,
                      }));
                      const userItems = hostUsers.map(u => ({
                        key: `user-${u.id}`,
                        kind: 'user' as const,
                        id: u.id,
                        title: u.name,
                        subtitle: u.email,
                      }));
                      let merged = [...brandItems, ...userItems];
                      if (brandSearchTerm.trim().length >= 2) {
                        merged = merged.filter(i =>
                          (i.title || '').toLowerCase().includes(lower) ||
                          (i.subtitle || '').toLowerCase().includes(lower)
                        );
                      }
                      const total = merged.length;
                      const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
                      const current = Math.min(hostsPage, pageCount);
                      const start = (current - 1) * PAGE_SIZE;
                      const slice = merged.slice(start, start + PAGE_SIZE);
                      return (
                        <div className="space-y-3">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-muted-foreground border-b border-white/10">
                                  <th className="py-2 pr-4">Name</th>
                                  <th className="py-2 pr-4">Info</th>
                                  <th className="py-2 pr-4">Experiences</th>
                                  <th className="py-2 pr-4">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {slice.map(item => {
                                  const count = hostCounts[(item as any).id?.toLowerCase?.() || ''] ?? 0;
                                  return (
                                    <tr key={item.key} className="border-b border-white/5">
                                      <td className="py-2 pr-4 text-foreground font-medium">{item.title}</td>
                                      <td className="py-2 pr-4 text-muted-foreground">{item.subtitle}</td>
                                      <td className="py-2 pr-4 text-muted-foreground">{count}</td>
                                      <td className="py-2 pr-4">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-white/20 text-foreground hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                          disabled={count === 0}
                                          onClick={() => {
                                            setSelectedHostForExperiences({ id: (item as any).id, name: item.title });
                                            setShowHostExperiencesModal(true);
                                          }}
                                        >
                                          Show Experiences
                                        </Button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                            {total === 0 && (
                              <div className="text-muted-foreground">No hosts found.</div>
                            )}
                          </div>
                          {pageCount > 1 && (
                            <div className="flex items-center justify-end gap-2 text-sm">
                              <button
                                className="px-2 py-1 border border-white/20 rounded disabled:opacity-50"
                                disabled={current === 1}
                                onClick={() => setHostsPage(p => Math.max(1, p - 1))}
                              >
                                Prev
                              </button>
                              <span className="text-muted-foreground">Page {current} of {pageCount}</span>
                              <button
                                className="px-2 py-1 border border-white/20 rounded disabled:opacity-50"
                                disabled={current === pageCount}
                                onClick={() => setHostsPage(p => Math.min(pageCount, p + 1))}
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Payments</h2>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-foreground hover:bg-white/10"
                        onClick={() => {
                          const rows = (allExperiences || []).filter(e => {
                            if (!paymentsFrom && !paymentsTo) return true;
                            const d = new Date(e.startDate || e.date || '').getTime();
                            const fromOk = paymentsFrom ? d >= new Date(paymentsFrom).getTime() : true;
                            const toOk = paymentsTo ? d <= new Date(paymentsTo).getTime() : true;
                            const hostOk = paymentsHostId ? ((e.hostId || '').toLowerCase() === paymentsHostId.toLowerCase()) : true;
                            const expOk = paymentsExperienceId ? (e.id === paymentsExperienceId) : true;
                            return fromOk && toOk && hostOk && expOk;
                          }).map(e => ({
                            Title: e.title,
                            HostId: e.hostId,
                            Price: e.basePriceCents || e.price || 0,
                          }));
                          exportToExcel(rows as any, 'payments');
                        }}
                      >
                        Export Excel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-foreground hover:bg-white/10"
                        onClick={() => {
                          const columns = ['Title', 'HostId', 'Price'];
                          const rows = (allExperiences || []).filter(e => {
                            if (!paymentsFrom && !paymentsTo) return true;
                            const d = new Date(e.startDate || e.date || '').getTime();
                            const fromOk = paymentsFrom ? d >= new Date(paymentsFrom).getTime() : true;
                            const toOk = paymentsTo ? d <= new Date(paymentsTo).getTime() : true;
                            const hostOk = paymentsHostId ? ((e.hostId || '').toLowerCase() === paymentsHostId.toLowerCase()) : true;
                            const expOk = paymentsExperienceId ? (e.id === paymentsExperienceId) : true;
                            return fromOk && toOk && hostOk && expOk;
                          }).map(e => [e.title, e.hostId, String(e.basePriceCents || e.price || 0)]);
                          exportToPdf(columns, rows as any, 'payments');
                        }}
                      >
                        Export PDF
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6 items-start flex-wrap">
                      <div className="flex flex-col text-sm">
                        <span className="text-muted-foreground mb-1">From</span>
                        <Input type="date" value={paymentsFrom} onChange={(e) => setPaymentsFrom(e.target.value)} className="h-8 w-[160px]" />
                      </div>
                      <div className="flex flex-col text-sm">
                        <span className="text-muted-foreground mb-1">To</span>
                        <Input type="date" value={paymentsTo} onChange={(e) => setPaymentsTo(e.target.value)} className="h-8 w-[160px]" />
                      </div>
                      <div className="w-px h-10 self-stretch bg-white/10" />
                      <div className="flex flex-col text-sm relative">
                        <span className="text-muted-foreground mb-1">Host</span>
                        <Input
                          value={paymentsHostName}
                          readOnly
                          placeholder="Select host"
                          className="h-8 w-[220px] cursor-pointer"
                          onClick={() => setPaymentsHostPickerOpen(v => !v)}
                        />
                        {paymentsHostPickerOpen && (
                          <div className="absolute top-9 left-10 z-10 w-[280px] max-h-64 overflow-auto bg-background/95 border border-white/10 rounded-md shadow-lg p-2">
                            <Input
                              value={paymentsHostSearch}
                              onChange={(e) => setPaymentsHostSearch(e.target.value)}
                              placeholder="Search host..."
                              className="h-8 mb-2"
                            />
                            {(() => {
                              const lower = paymentsHostSearch.toLowerCase();
                              const hostUsers = users.filter(u => /^(host|admin)$/i.test(u.role));
                              const brandItems = brands.map(b => ({ id: b.id, title: b.name, subtitle: b.ownerName || b.ownerEmail }));
                              const userItems = hostUsers.map(u => ({ id: u.id, title: u.name, subtitle: u.email }));
                              return [...brandItems, ...userItems]
                                .filter(i => !lower || (i.title || '').toLowerCase().includes(lower) || (i.subtitle || '').toLowerCase().includes(lower))
                                .slice(0, 50)
                                .map(item => (
                                  <button
                                    key={item.id}
                                    className="w-full text-left px-3 py-2 rounded hover:bg-white/10"
                                    onClick={() => { setPaymentsHostId(item.id); setPaymentsHostName(item.title); setPaymentsHostPickerOpen(false); setPaymentsHostSearch(""); }}
                                  >
                                    <div className="text-foreground text-sm font-medium">{item.title}</div>
                                    <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                                  </button>
                                ));
                            })()}
                            <div className="pt-2 mt-2 border-t border-white/10 flex justify-end gap-2">
                              {(paymentsHostId || paymentsHostName) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                  onClick={() => { setPaymentsHostId(""); setPaymentsHostName(""); setPaymentsHostSearch(""); setPaymentsHostPickerOpen(false); }}
                                >
                                  Clear
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="h-8" onClick={() => setPaymentsHostPickerOpen(false)}>Close</Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col text-sm relative">
                        <span className="text-muted-foreground mb-1">Experience</span>
                        <Input
                          value={paymentsExperienceName}
                          readOnly
                          placeholder="Select experience"
                          className="h-8 w-[260px] cursor-pointer"
                          onClick={() => setPaymentsExperiencePickerOpen(v => !v)}
                        />
                        {paymentsExperiencePickerOpen && (
                          <div className="absolute top-9 left-20 z-10 w-[320px] max-h-64 overflow-auto bg-background/95 border border-white/10 rounded-md shadow-lg p-2">
                            <Input
                              value={paymentsExperienceSearch}
                              onChange={(e) => setPaymentsExperienceSearch(e.target.value)}
                              placeholder="Search experience..."
                              className="h-8 mb-2"
                            />
                            {(() => {
                              const lower = paymentsExperienceSearch.toLowerCase();
                              const list = (allExperiences || []);
                              return list
                                .filter(e => !lower || (e.title || '').toLowerCase().includes(lower))
                                .slice(0, 50)
                                .map(e => (
                                  <button
                                    key={e.id}
                                    className="w-full text-left px-3 py-2 rounded hover:bg-white/10"
                                    onClick={() => { setPaymentsExperienceId(e.id); setPaymentsExperienceName(e.title); setPaymentsExperiencePickerOpen(false); setPaymentsExperienceSearch(""); }}
                                  >
                                    <div className="text-foreground text-sm font-medium">{e.title}</div>
                                    <div className="text-xs text-muted-foreground">{e.location} • {e.startDate || e.date}</div>
                                  </button>
                                ));
                            })()}
                            <div className="pt-2 mt-2 border-t border-white/10 flex justify-end gap-2">
                              {(paymentsExperienceId || paymentsExperienceName) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                  onClick={() => { setPaymentsExperienceId(""); setPaymentsExperienceName(""); setPaymentsExperienceSearch(""); setPaymentsExperiencePickerOpen(false); }}
                                >
                                  Clear
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="h-8" onClick={() => setPaymentsExperiencePickerOpen(false)}>Close</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {showMembersModal && selectedBrandForMembers && (
        <MembersListModal
          isOpen={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          brandId={selectedBrandForMembers.id}
          brandName={selectedBrandForMembers.name}
        />
      )}
      <Dialog open={showHostExperiencesModal} onOpenChange={setShowHostExperiencesModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Experiences hosted by {selectedHostForExperiences?.name}</DialogTitle>
            <DialogDescription>List of experiences for the selected host</DialogDescription>
          </DialogHeader>
          {(() => {
            const hostId = (selectedHostForExperiences?.id || '').toLowerCase();
            const count = hostCounts[hostId] ?? 0;
            if (count < 5) return null;
            return (
              <div className="flex items-center gap-3 mb-3">
                <Input
                  value={experienceSearchTerm}
                  onChange={(e) => setExperienceSearchTerm(e.target.value)}
                  placeholder="Find experience by title or location"
                  className="max-w-md"
                />
              </div>
            );
          })()}
          <div className="max-h-[60vh] overflow-auto divide-y divide-white/10">
            {(() => {
              const hostId = (selectedHostForExperiences?.id || '').toLowerCase();
              const base = allExperiences.filter(e => (e.hostId || '').toLowerCase() === hostId);
              const q = experienceSearchTerm.trim().toLowerCase();
              const list = q.length >= 2
                ? base.filter(e => (e.title || '').toLowerCase().includes(q) || (e.location || '').toLowerCase().includes(q))
                : base;
              return list;
            })().map(e => (
                <div key={e.id} className="py-3">
                  <div className="text-foreground font-medium">{e.title}</div>
                  <div className="text-sm text-muted-foreground">{e.location} • {e.startDate || e.date}</div>
                </div>
            ))}
            {(() => {
              const hostId = (selectedHostForExperiences?.id || '').toLowerCase();
              const base = allExperiences.filter(e => (e.hostId || '').toLowerCase() === hostId);
              const q = experienceSearchTerm.trim().toLowerCase();
              const count = q.length >= 2
                ? base.filter(e => (e.title || '').toLowerCase().includes(q) || (e.location || '').toLowerCase().includes(q)).length
                : base.length;
              return count === 0;
            })() && (
              <div className="text-muted-foreground">No experiences found for this host.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
};

export default Settings;

// Modal portal
{/* Members List Modal */}
{/* Placed after default export in this file is not effective; actual modal mount is inline below in JSX */}
