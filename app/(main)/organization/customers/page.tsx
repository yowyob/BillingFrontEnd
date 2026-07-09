"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Users, Mail, Phone, Building2, Tag,
  CheckCircle2, XCircle, ChevronRight, MoreVertical, ShieldCheck, Send, UserCheck
} from "lucide-react";
import { ClientsService, ClientResponse, CustomerAssignmentsService, CustomerAssignmentResponse } from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { toast } from "sonner";
import TableSkeleton from "@/components/TableSkeleton";
import EmptyState from "@/components/EmptyState";
import ActionButton from "@/components/ActionButton";
import SaleConfigModal from "./SaleConfigModal";
import AssignSellerModal from "./AssignSellerModal";

const COLUMNS = ["Customer", "Contact", "Type", "Sale Sizes", "Assigned Seller", "Status", ""];

const TYPE_LABELS: Record<string, string> = {
  PARTICULIER: "Individual",
  ENTREPRISE: "Company",
  ADMINISTRATION: "Administration",
};

const CustomersAdminPage = () => {
  const [customers, setCustomers] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [configCustomer, setConfigCustomer] = useState<ClientResponse | null>(null);
  const [assignCustomer, setAssignCustomer] = useState<ClientResponse | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, CustomerAssignmentResponse>>({});
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ClientsService.getAllClients();
      setCustomers(res);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    const org = getStoredSeller();
    if (!org?.organizationId) return;
    try {
      const res = await CustomerAssignmentsService.listByOrganization(org.organizationId);
      const byClientId: Record<string, CustomerAssignmentResponse> = {};
      res.forEach((a) => { if (a.clientId) byClientId[a.clientId] = a; });
      setAssignments(byClientId);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchAssignments();
  }, [fetchCustomers, fetchAssignments]);

  const handleAssignModalClose = (updated: boolean) => {
    setAssignCustomer(null);
    if (updated) fetchAssignments();
  };

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((c) =>
      [c.username, c.raisonSociale, c.codeClient, c.email, c.telephone].some((v) => v?.toLowerCase().includes(term))
    );
  }, [customers, search]);

  const activeCount = useMemo(() => customers.filter((c) => c.actif).length, [customers]);
  const companyCount = useMemo(() => customers.filter((c) => c.typeClient === ClientResponse.typeClient.ENTREPRISE).length, [customers]);

  const handleConfigModalClose = (updated: boolean) => {
    setConfigCustomer(null);
    if (updated) fetchCustomers();
  };

  const handleInvite = async (customer: ClientResponse) => {
    if (!customer.idClient) return;
    const name = customer.raisonSociale || customer.username || "Client";
    let email = customer.email || "";
    if (!email) {
      const entered = window.prompt(`No email on file for ${name}. Enter an email to send the invite to:`);
      if (!entered) return;
      email = entered.trim();
    }
    setActiveMenuId(null);
    setInvitingId(customer.idClient);
    try {
      await ClientsService.inviteClient(customer.idClient, { email, name });
      toast.success(`Invitation sent to ${email}.`);
    } catch (error) {
      console.error("Error inviting customer:", error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <div className="p-8 bg-secondary-background min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-secondary-gray mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest">Organization</span>
            <ChevronRight size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-mid">Customers</span>
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Customers</h1>
          <p className="text-secondary-gray text-sm font-medium">
            Customer accounts registered for your organization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <Users size={16} className="text-secondary-mid" />
            <span className="text-xs font-black text-primary">{customers.length}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Customers</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-xs font-black text-primary">{activeCount}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Active</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <Building2 size={16} className="text-blue-500" />
            <span className="text-xs font-black text-primary">{companyCount}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Companies</span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-secondary-light mb-6">
        <div className="relative group max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-gray group-focus-within:text-secondary-mid transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search by name, code, email or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary-background border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-secondary-mid/20 focus:border-secondary-mid transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-secondary-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-super-light/30 border-b border-secondary-light">
                {COLUMNS.map((col) => (
                  <th key={col} className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary-gray whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <TableSkeleton cols={COLUMNS.length} />
              ) : filteredCustomers.length === 0 ? (
                <EmptyState title="No customers found" message="Try adjusting your search." />
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.idClient} className="hover:bg-secondary-super-light/40 transition-all group border-l-4 border-l-transparent hover:border-l-secondary-mid">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-primary group-hover:text-secondary-mid transition-colors">
                          {customer.raisonSociale || customer.username}
                        </span>
                        {customer.codeClient && (
                          <span className="text-[11px] font-bold text-secondary-gray">{customer.codeClient}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1 text-[11px] font-bold text-secondary-gray">
                        {customer.email && (
                          <span className="flex items-center gap-1.5"><Mail size={11} className="text-secondary-mid" /> {customer.email}</span>
                        )}
                        {customer.telephone && (
                          <span className="flex items-center gap-1.5"><Phone size={11} className="text-secondary-mid" /> {customer.telephone}</span>
                        )}
                        {!customer.email && !customer.telephone && "-"}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-secondary-super-light text-secondary-mid rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Tag size={11} /> {TYPE_LABELS[customer.typeClient ?? ""] || customer.typeClient || "-"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {customer.allowedSaleSizes && customer.allowedSaleSizes.length > 0 ? (
                          customer.allowedSaleSizes.map((s) => (
                            <span key={s} className="px-2 py-0.5 bg-secondary-super-light text-secondary-mid rounded-md text-[9px] font-black uppercase tracking-widest">
                              {s.replace(/_/g, " ")}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] font-bold text-secondary-gray">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {customer.idClient && assignments[customer.idClient] ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-secondary-super-light text-secondary-mid rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <UserCheck size={11} /> {assignments[customer.idClient].sellerName || "Assigned"}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-secondary-gray">Unassigned</span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      {customer.actif ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 size={11} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-red-50 text-red-500 border border-red-200 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <XCircle size={11} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === customer.idClient ? null : (customer.idClient ?? null))}
                        className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenuId === customer.idClient && (
                        <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                          <ActionButton
                            label="Sale Config"
                            onClick={() => {
                              setConfigCustomer(customer);
                              setActiveMenuId(null);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-secondary-mid"
                          >
                            <ShieldCheck size={14} />
                          </ActionButton>
                          <ActionButton
                            label="Invite to Portal"
                            onClick={() => handleInvite(customer)}
                            disabled={invitingId === customer.idClient}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-secondary-mid disabled:opacity-40"
                          >
                            {invitingId === customer.idClient ? (
                              <span className="h-3.5 w-3.5 border-2 border-secondary-mid border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Send size={14} />
                            )}
                          </ActionButton>
                          <ActionButton
                            label="Assign Seller"
                            onClick={() => {
                              setAssignCustomer(customer);
                              setActiveMenuId(null);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-secondary-mid"
                          >
                            <UserCheck size={14} />
                          </ActionButton>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SaleConfigModal isOpen={!!configCustomer} customer={configCustomer} onClose={handleConfigModalClose} />
      <AssignSellerModal isOpen={!!assignCustomer} customer={assignCustomer} onClose={handleAssignModalClose} />
    </div>
  );
};

export default CustomersAdminPage;
