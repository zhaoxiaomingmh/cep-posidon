import { forwardRef } from "react"
import './Face.scss'
import { PsTable } from "@/hooks/table/PsTable";
import { PsTableItem } from "@/hooks/table/PsTableItem";
import React from 'react';
import { AssetSearch, AssetSearchRef } from "@/pages/search/AssetSearch";
import { Settings, SettingsRef } from "@/pages/settings/Settings";
import { PsdLevel, PsdLevelRef } from "@/pages/level/PsdLevel";

export const Face = forwardRef(() => {
    return (
        <div className="ps-face">
            <PsTable>
                <PsTableItem
                    id={"asset-search"}
                    icon={
                        <svg className="icon" viewBox="0 0 1032 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4578" width="26" height="26">
                            <path d="M969.975 905.855L842.142 796.532a39.382 39.382 0 1 0-55.686 55.686L914.29 961.54a39.382 39.382 0 1 0 55.686-55.686z" p-id="4579"></path>
                            <path d="M468.41 841.112a381.135 381.135 0 1 0 0-762.27 381.135 381.135 0 0 0 0 762.27z m0 78.763a459.898 459.898 0 1 1 0-919.796 459.898 459.898 0 0 1 0 919.796z" p-id="4580"></path>
                        </svg>
                    }  >
                    <AssetSearch ref={AssetSearchRef} />
                </PsTableItem>
                <PsTableItem
                    id={"psd-level"}
                    icon={
                        <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7159" xmlnsXlink="http://www.w3.org/1999/xlink" width="26" height="26">
                            <path d="M767 640h96c17.673 0 32 14.327 32 32v192c0 17.673-14.327 32-32 32H607c-17.673 0-32-14.327-32-32V672c0-17.673 14.327-32 32-32h96v-96H319v96h96c17.673 0 32 14.327 32 32v192c0 17.673-14.327 32-32 32H159c-17.673 0-32-14.327-32-32V672c0-17.673 14.327-32 32-32h96V512c0-17.673 14.327-32 32-32h192v-96h-96c-17.673 0-32-14.327-32-32V160c0-17.673 14.327-32 32-32h256c17.673 0 32 14.327 32 32v192c0 17.673-14.327 32-32 32h-96v96h192c17.673 0 32 14.327 32 32v128z m-128 64v128h192V704H639z m-448 0v128h192V704H191z m224-512v128h192V192H415z" p-id="7160"></path>
                        </svg>
                    }  >
                    <PsdLevel ref={PsdLevelRef} />
                </PsTableItem>
                <PsTableItem id="gap" isGap></PsTableItem>
                <PsTableItem
                    id="settings"
                    icon={
                        <svg viewBox="0 0 36 36" width="26px" height="26px" className="flex mx-auto my-auto" focusable="false" aria-hidden="true" role="img">
                            <path fillRule="evenodd" d="M32.9,15.793H29.789a11.953,11.953,0,0,0-1.842-4.507L30.152,9.08a1.1,1.1,0,0,0,0-1.56L28.479,5.848a1.1,1.1,0,0,0-1.56,0L24.714,8.053a11.925,11.925,0,0,0-4.507-1.841V3.1A1.1,1.1,0,0,0,19.1,2H16.9a1.1,1.1,0,0,0-1.1,1.1V6.212a11.925,11.925,0,0,0-4.507,1.841l-2.2-2.205a1.1,1.1,0,0,0-1.56,0L5.848,7.52a1.1,1.1,0,0,0,0,1.56l2.205,2.206a11.953,11.953,0,0,0-1.842,4.507H3.1A1.1,1.1,0,0,0,2,16.9V19.1a1.1,1.1,0,0,0,1.1,1.1H6.211a11.934,11.934,0,0,0,1.842,4.507L5.848,26.919a1.1,1.1,0,0,0,0,1.56l1.673,1.673a1.1,1.1,0,0,0,1.56,0l2.205-2.205a11.925,11.925,0,0,0,4.507,1.841V32.9A1.1,1.1,0,0,0,16.9,34H19.1a1.1,1.1,0,0,0,1.1-1.1V29.788a11.925,11.925,0,0,0,4.507-1.841l2.205,2.205a1.1,1.1,0,0,0,1.56,0l1.673-1.673a1.1,1.1,0,0,0,0-1.56l-2.205-2.205a11.934,11.934,0,0,0,1.842-4.507H32.9A1.1,1.1,0,0,0,34,19.1V16.9A1.1,1.1,0,0,0,32.9,15.793ZM22.414,18A4.414,4.414,0,1,1,18,13.586,4.414,4.414,0,0,1,22.414,18Z"></path>
                        </svg>
                    } >
                    <Settings ref={SettingsRef} />
                </PsTableItem>
            </PsTable>
        </div >
    );
})