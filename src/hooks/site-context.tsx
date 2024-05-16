"use client"

import React from "react";
import { SiteInfo } from "@prisma/client";

export interface AppContextProps {
    site: Partial<SiteInfo>;
    setSite: React.Dispatch<React.SetStateAction<Partial<SiteInfo>>>;
}

export const SiteContext = React.createContext({});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [site, setSite] = React.useState<Partial<SiteInfo> | null>(null);


    React.useEffect(() => {
        const fetchSite = async () => {
            const response = await fetch("/api/data/site");
            const data = await response.json();
            setSite(data.siteInfo);
        };

        fetchSite();
    }, []);

    const value = {
        site,
        setSite,
    } as AppContextProps;

    return (
        <SiteContext.Provider value={value}>
            {children}
        </SiteContext.Provider>
    );
};