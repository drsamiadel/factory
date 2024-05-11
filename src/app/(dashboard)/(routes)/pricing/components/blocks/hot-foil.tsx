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

const HotFoilComponent = ({ hotFoil, input, handleChange, initialValues }: { hotFoil: any, input: any, handleChange: any, initialValues?: any }) => {
    const blockIndex = input.structure.additional.findIndex((block: any) => block.id === hotFoil.id);

    const printSizeOptions = [{ id: 1, name: "100x70", value: 1 }, { id: 2, name: "50x70", value: 2 }, { id: 3, name: "50x35", value: 4 }];


    const currentPeice = hotFoil.peiceId;
    const currentPage = input.structure.additional.find((page: any) => page.peiceId === currentPeice && page.code === 1);
    const allPage = input.structure.additional.find((page: any) => page.peiceId === "all" && page.code === 1);
    const sheetsQuantity = currentPage ? currentPage.structure.sheetsQuantity : allPage ? allPage.structure.sheetsQuantity : 0;

    React.useEffect(() => {
        function calculateQuantity() {
            if (currentPeice) {
                const quantity = sheetsQuantity * (printSizeOptions.find((size: any) => size.id === hotFoil.structure.paperSize)?.value || 0);
                handleChange({ target: { name: `structure.additional[${blockIndex}].structure.quantity`, value: quantity } }, true);
            }
        }

        calculateQuantity();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetsQuantity, currentPeice, hotFoil.structure.paperSize]);

    React.useEffect(() => {
        function calculateTotalCost() {
            const totalCost = (+hotFoil.structure.quantity / 1000) * (+hotFoil.structure.costPrint || 0) * (+hotFoil.structure.numberOfColor || 1) + (+hotFoil.structure.clicheCost || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.totalCost`, value: totalCost } }, true);
        }

        calculateTotalCost();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotFoil.structure.costPrint, hotFoil.structure.clicheCost, hotFoil.structure.quantity, hotFoil.structure.numberOfColor]);

    return (
        <Grid item xs={12}>
            <Grid container spacing={2}>
                <Grid item xs={2}>
                    <Autocomplete
                        id="combo-for-paperSize"
                        options={printSizeOptions}
                        getOptionLabel={(option) => option.name}
                        renderOption={(props, option) => (
                            <ListItem {...props} key={option.id}> <ListItemText primary={option.name} /> </ListItem>
                        )}
                        value={printSizeOptions.find((size: any) => size.id === hotFoil.structure.paperSize) || printSizeOptions[0]}
                        renderInput={(params) => <TextField {...params} label="Paper Size" />}
                        onChange={(event, value) => {
                            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.paperSize`, value: value ? value.id : null } });
                        }}
                        size='small'
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                </Grid>
                <Grid item xs={1.5}>
                    <TextField
                        fullWidth
                        label="Print Size"
                        name={`structure.additional[${blockIndex}].structure.printSize`}
                        value={hotFoil.structure.printSize || ""}
                        onChange={handleChange}
                        size='small'
                    />
                </Grid>
                <Grid item xs={1.5}>
                    <TextField
                        fullWidth
                        label="Number of Color"
                        name={`structure.additional[${blockIndex}].structure.numberOfColor`}
                        value={hotFoil.structure.numberOfColor || 1}
                        onChange={handleChange}
                        size='small'
                    />
                </Grid>
                <Grid item xs={1.5}>
                    <TextField
                        fullWidth
                        label="Print Quantity"
                        name={`structure.additional[${blockIndex}].structure.quantity`}
                        value={hotFoil.structure.quantity || 0}
                        onChange={handleChange}
                        size='small'
                        disabled
                    />
                </Grid>
                <Grid item xs={1.5}>
                    <TextField
                        fullWidth
                        label="Cost Print"
                        name={`structure.additional[${blockIndex}].structure.costPrint`}
                        value={+hotFoil.structure.costPrint || 0}
                        onChange={handleChange}
                        size='small'
                    />
                </Grid>
                <Grid item xs={1.5}>
                    <TextField
                        fullWidth
                        label="Cliche Cost"
                        name={`structure.additional[${blockIndex}].structure.clicheCost`}
                        value={+hotFoil.structure.clicheCost || 0}
                        onChange={handleChange}
                        size='small'
                    />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2} sx={{ justifyContent: "end", alignItems: "end" }} direction="column">
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                label="Total Cost"
                                value={hotFoil.structure.totalCost || 0}
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

export default HotFoilComponent;