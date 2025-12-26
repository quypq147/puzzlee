"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization } from '@/types/custom';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  setCurrentOrganization: (org: Organization) => void;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrgs = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      // Gọi API lấy danh sách Org của User
      const res = await apiClient.get('/organizations'); 
      const orgs = res.data;
      setOrganizations(orgs);
      
      // Logic chọn Org mặc định:
      // 1. Nếu đã chọn trước đó (lưu ở localStorage) -> lấy lại
      // 2. Nếu chưa -> lấy Org đầu tiên
      const savedOrgId = localStorage.getItem('lastOrgId');
      const savedOrg = orgs.find((o: Organization) => o.id === savedOrgId);
      
      if (savedOrg) {
        setCurrentOrganization(savedOrg);
      } else if (orgs.length > 0) {
        setCurrentOrganization(orgs[0]);
      }
    } catch (error) {
      console.error("Failed to load organizations", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, [user]);

  // Lưu lựa chọn vào LocalStorage khi thay đổi
  const handleSetCurrentOrg = (org: Organization) => {
    setCurrentOrganization(org);
    localStorage.setItem('lastOrgId', org.id);
  };

  return (
    <OrganizationContext.Provider value={{ 
      organizations, 
      currentOrganization, 
      setCurrentOrganization: handleSetCurrentOrg, 
      isLoading,
      refreshOrganizations: fetchOrgs 
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};