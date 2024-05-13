import * as React from 'react';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import { v4 as uuidv4 } from 'uuid';
import { Material } from '@prisma/client';
import { useDebounce } from '../../../../../../lib/use-debounce';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

const LaminationComponent = ({ lamination, input, handleChange, initialValues }: { lamination: any, input: any, handleChange: any, initialValues?: any }) => {
    const blockIndex = input.structure.additional.findIndex((block: any) => block.id === lamination.id);
    const printSizeOptions = [{ id: 1, name: "100x70", value: 1 }, { id: 2, name: "50x70", value: 2 }, { id: 3, name: "50x35", value: 4 }];

    const currentPeice = lamination.peiceId;
    const currentPage = input.structure.additional.find((page: any) => page.peiceId === currentPeice && page.code === 1);
    const sheetsQuantity = currentPage ? currentPage.structure.sheetsQuantity : 0;
    const currentOffset = input.structure.additional.find((page: any) => page.peiceId === currentPeice && page.code === 2);
    const allOffset = input.structure.additional.find((page: any) => page.peiceId === "all" && page.code === 2);
    const offsetQuantity = currentOffset ? currentOffset.structure.quantity : allOffset ? allOffset.structure.quantity : 0;

    React.useEffect(() => {
        function calculateCostFront() {
            const laminationCost = lamination.structure.faces[0].laminationCost || 0;
            const quantity = sheetsQuantity * (printSizeOptions.find((size: any) => size.id === lamination.structure.faces[0].laminationSize)?.value || 0);
            const thousand = +(quantity / 1000).toFixed(2);
            const totalCost = +laminationCost * +thousand;
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[0].totalCost`, value: totalCost } }, true);
        }

        function calculateCostBack() {
            const laminationCost = lamination.structure.faces[1].laminationCost || 0;
            const quantity = sheetsQuantity * (printSizeOptions.find((size: any) => size.id === lamination.structure.faces[1].laminationSize)?.value || 0);
            const thousand = +(quantity / 1000).toFixed(2);
            const totalCost = +laminationCost * +thousand;
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[1].totalCost`, value: totalCost } }, true);
        }

        function calculateTotalCost() {
            const totalCost = (
                lamination.structure.faces[0].active ? lamination.structure.faces[0].totalCost : 0
            ) + (
                    lamination.structure.faces[1].active ? lamination.structure.faces[1].totalCost : 0
                );
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.totalCost`, value: totalCost } }, true);
        }

        calculateCostFront();
        calculateCostBack();
        calculateTotalCost();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetsQuantity, lamination.structure.faces[0].laminationCost, lamination.structure.faces[1].laminationCost, lamination.structure.faces[0].active, lamination.structure.faces[1].active, lamination.structure.faces[0].laminationSize, lamination.structure.faces[1].laminationSize]);

    React.useEffect(() => {
        function calculateQuantityFace() {
            const quantity = sheetsQuantity * (printSizeOptions.find((size: any) => size.id === lamination.structure.faces[0].laminationSize)?.value || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[0].quantity`, value: quantity } }, true);
        }
        calculateQuantityFace();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetsQuantity, lamination.structure.faces[0].laminationSize]);

    React.useEffect(() => {
        function calculateQuantityBack() {
            const quantity = sheetsQuantity * (printSizeOptions.find((size: any) => size.id === lamination.structure.faces[1].laminationSize)?.value || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[1].quantity`, value: quantity } }, true);
        }
        calculateQuantityBack();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetsQuantity, lamination.structure.faces[1].laminationSize]);

    return (
        <Grid item xs={12}>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <Checkbox checked={lamination.structure.faces[0].active} onChange={(e) => handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[0].active`, value: e.target.checked } })} />
                    {lamination.structure.faces[0].name}
                </Grid>
                {!!lamination.structure.faces[0].active && (
                    <>
                        <Grid item xs={2.5}>
                            <Autocomplete
                                id="combo-for-laminationType"
                                options={["MATT", "GLOSSY", "Gold Metallic", "Server Metallic", "Velvet"]}
                                getOptionLabel={(option) => option.toString()}
                                renderOption={(props, option) => (
                                    <ListItem {...props} key={option}> <ListItemText primary={option} /> </ListItem>
                                )}
                                renderInput={(params) => <TextField {...params} label="Lamination Type" />}
                                onChange={(event, value) => {
                                    handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[0].laminationType`, value: value ? value : null } });
                                }}
                                size='small'
                                value={lamination.structure.faces[0].laminationType || ""}
                                disabled={!!!lamination.structure.faces[0].active}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <Autocomplete
                                id="combo-for-printSize"
                                options={printSizeOptions}
                                getOptionLabel={(option) => option.name}
                                renderOption={(props, option) => (
                                    <ListItem {...props} key={option.id}> <ListItemText primary={option.name} /> </ListItem>
                                )}
                                value={printSizeOptions.find((size: any) => size.id === lamination.structure.faces[0].laminationSize) || printSizeOptions[0]}
                                renderInput={(params) => <TextField {...params} label="Lamination Size" />}
                                onChange={(event, value) => {
                                    handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[0].laminationSize`, value: value ? value.id : null } });
                                }}
                                size='small'
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Lamination Quantity"
                                name={`structure.additional[${blockIndex}].structure.quantity`}
                                value={lamination.structure.faces[0].quantity || 0}
                                onChange={handleChange}
                                size='small'
                                disabled
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Lamination Cost"
                                name={`structure.additional[${blockIndex}].structure.faces[0].laminationCost`}
                                value={+lamination.structure.faces[0].laminationCost || 0}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!lamination.structure.faces[0].active}
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Cost"
                                value={lamination.structure.faces[0].totalCost || 0}
                                onChange={(e) => handleChange(e)}
                                disabled
                                size='small'
                            />
                        </Grid>
                    </>
                )}
                <Grid item xs={12} sx={{ padding: "0px!important" }} />
                <Grid item xs={3}>
                    <Checkbox checked={lamination.structure.faces[1].active} onChange={(e) => handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[1].active`, value: e.target.checked } })} />
                    {lamination.structure.faces[1].name}
                </Grid>
                {!!lamination.structure.faces[1].active && (
                    <>
                        <Grid item xs={2.5}>
                            <Autocomplete
                                id="combo-for-laminationType"
                                options={["MATT", "GLOSSY", "Gold Metallic", "Server Metallic", "Velvet"]}
                                getOptionLabel={(option) => option.toString()}
                                renderOption={(props, option) => (
                                    <ListItem {...props} key={option}> <ListItemText primary={option} /> </ListItem>
                                )}
                                renderInput={(params) => <TextField {...params} label="Lamination Type" />}
                                onChange={(event, value) => {
                                    handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[1].laminationType`, value: value ? value : null } });
                                }}
                                size='small'
                                value={lamination.structure.faces[1].laminationType || ""}
                                disabled={!!!lamination.structure.faces[1].active}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <Autocomplete
                                id="combo-for-printSize"
                                options={printSizeOptions}
                                getOptionLabel={(option) => option.name}
                                renderOption={(props, option) => (
                                    <ListItem {...props} key={option.id}> <ListItemText primary={option.name} /> </ListItem>
                                )}
                                value={printSizeOptions.find((size: any) => size.id === lamination.structure.faces[1].laminationSize) || printSizeOptions[0]}
                                renderInput={(params) => <TextField {...params} label="Lamination Size" />}
                                onChange={(event, value) => {
                                    handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[1].laminationSize`, value: value ? value.id : null } });
                                }}
                                size='small'
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Lamination Quantity"
                                name={`structure.additional[${blockIndex}].structure.quantity`}
                                value={lamination.structure.faces[1].quantity || 0}
                                onChange={handleChange}
                                size='small'
                                disabled
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Lamination Cost"
                                name={`structure.additional[${blockIndex}].structure.faces[1].laminationCost`}
                                value={+lamination.structure.faces[1].laminationCost || 0}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!lamination.structure.faces[1].active}
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Cost"
                                value={lamination.structure.faces[1].totalCost || 0}
                                onChange={(e) => handleChange(e)}
                                disabled
                                size='small'
                            />
                        </Grid>
                    </>
                )}
                <Grid item xs={12}>
                    <Grid container spacing={2} sx={{ justifyContent: "end", alignItems: "end" }} direction="column">
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                label="Total Cost"
                                value={lamination.structure.totalCost || 0}
                                onChange={(e) => handleChange(e)}
                                disabled
                                size='small'
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
};

export default LaminationComponent;