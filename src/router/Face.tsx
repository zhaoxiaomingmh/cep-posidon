import { forwardRef } from "react"
import './Face.scss'
import { PsTable } from "@/hooks/table/PsTable";
import { PsTableItem } from "@/hooks/table/PsTableItem";
import React from 'react';
import { AssetSearch, AssetSearchRef } from "@/pages/search/AssetSearch";

export const Face = forwardRef(() => {
    return (
        <div className="ps-face">
            <PsTable>
                <PsTableItem
                    id={"asset-search"}
                    icon={
                        <svg className="icon" viewBox="0 0 1032 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4578" width="26" height="26">
                            <path d="M969.975 905.855L842.142 796.532a39.382 39.382 0 1 0-55.686 55.686L914.29 961.54a39.382 39.382 0 1 0 55.686-55.686z" p-id="4579" fill="#ebebeb"></path>
                            <path d="M468.41 841.112a381.135 381.135 0 1 0 0-762.27 381.135 381.135 0 0 0 0 762.27z m0 78.763a459.898 459.898 0 1 1 0-919.796 459.898 459.898 0 0 1 0 919.796z" p-id="4580" fill="#ebebeb"></path>
                        </svg>
                    }  >
                    <AssetSearch ref={AssetSearchRef} />
                </PsTableItem>
                <PsTableItem
                    id={"psd-level"}
                    icon={
                        <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7159" xmlnsXlink="http://www.w3.org/1999/xlink" width="26" height="26">
                            <path d="M767 640h96c17.673 0 32 14.327 32 32v192c0 17.673-14.327 32-32 32H607c-17.673 0-32-14.327-32-32V672c0-17.673 14.327-32 32-32h96v-96H319v96h96c17.673 0 32 14.327 32 32v192c0 17.673-14.327 32-32 32H159c-17.673 0-32-14.327-32-32V672c0-17.673 14.327-32 32-32h96V512c0-17.673 14.327-32 32-32h192v-96h-96c-17.673 0-32-14.327-32-32V160c0-17.673 14.327-32 32-32h256c17.673 0 32 14.327 32 32v192c0 17.673-14.327 32-32 32h-96v96h192c17.673 0 32 14.327 32 32v128z m-128 64v128h192V704H639z m-448 0v128h192V704H191z m224-512v128h192V192H415z" fill="#000000" p-id="7160"></path>
                        </svg>
                    }  >
                    <div>
                        功能测试2
                    </div>
                </PsTableItem>
            </PsTable>
        </div >
    );
})