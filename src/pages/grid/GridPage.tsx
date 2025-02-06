import { PsFunc } from "@/hooks/func/PsFunc";
import { PsFuncItem } from "@/hooks/func/PsFuncItem";
import React from "react";
import { forwardRef } from "react";
import { Grid, GridRef } from "./component/grid/Grid";

type GridPageProps = {
}
type GridPageRefType = {
};
export const GridPageRef = React.createRef<GridPageRefType>();
export const GridPage = forwardRef<GridPageRefType, GridPageProps>((props, ref) => {
    return (
        <PsFunc>
            <PsFuncItem id={"grid"} title={('九宫格')}>
                <Grid ref={GridRef}></Grid>
            </PsFuncItem>
        </PsFunc>
    );
})