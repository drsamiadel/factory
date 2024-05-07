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

const SilkScreenComponent = ({ silkScreen, input, handleChange, initialValues }: { silkScreen: any, input: any, handleChange: any, initialValues?: any }) => {
    const blockIndex = input.structure.additional.findIndex((block: any) => block.id === silkScreen.id);

    const printSizeOptions = [{ id: 1, name: "100x70", value: 1 }, { id: 2, name: "50x70", value: 2 }, { id: 3, name: "50x35", value: 4 }];


    const currentPeice = silkScreen.peiceId;
    const currentPage = input.structure.additional.find((page: any) => page.peiceId === currentPeice && page.code === 1);
    const allPage = input.structure.additional.find((page: any) => page.peiceId === "all" && page.code === 1);
    const sheetsQuantity = currentPage ? currentPage.structure.sheetsQuantity : allPage ? allPage.structure.sheetsQuantity : 0;

    React.useEffect(() => {
        function calculateQuantity() {
            if (currentPeice) {
                const quantity = sheetsQuantity * (printSizeOptions.find((size: any) => size.id === silkScreen.structure.paperSize)?.value || 0);
                handleChange({ target: { name: `structure.additional[${blockIndex}].structure.quantity`, value: quantity } }, true);
            }
        }

        calculateQuantity();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetsQuantity, currentPeice, silkScreen.structure.paperSize]);

    React.useEffect(() => {
        function calculateTotalCost() {
            const totalCost = (+silkScreen.structure.quantity / 1000) * (+silkScreen.structure.costPrint || 0) * (+silkScreen.structure.numberOfColor || 1);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.totalCost`, value: totalCost } }, true);
        }

        calculateTotalCost();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [silkScreen.structure.costPrint, silkScreen.structure.quantity, silkScreen.structure.numberOfColor]);

    return (
        <Grid item xs={12}>
            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <FormControl fullWidth>
                        <InputLabel id="selectPart">select a part</InputLabel>
                        <Select
                            size='small'
                            labelId="selectPart"
                            id="selectPart"
                            value={silkScreen.peiceId ? silkScreen.peiceId : ""}
                            label="select a part"
                            name={`structure.additional[${blockIndex}].peiceId`}
                            onChange={(e: SelectChangeEvent) => handleChange(e)}
                        >
                            <MenuItem value="all" key="all">All</MenuItem>
                            {input.structure.input.structure.peices.map((peice: any) => (
                                <MenuItem value={peice.id} key={peice.id}>{peice.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={4}>
                    <Autocomplete
                        id="combo-for-paperSize"
                        options={printSizeOptions}
                        getOptionLabel={(option) => option.name}
                        renderOption={(props, option) => (
                            <ListItem {...props} key={option.id}> <ListItemText primary={option.name} /> </ListItem>
                        )}
                        value={printSizeOptions.find((size: any) => size.id === silkScreen.structure.paperSize) || printSizeOptions[0]}
                        renderInput={(params) => <TextField {...params} label="Paper Size" />}
                        onChange={(event, value) => {
                            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.paperSize`, value: value ? value.id : null } });
                        }}
                        size='small'
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Print Size"
                        name={`structure.additional[${blockIndex}].structure.printSize`}
                        value={silkScreen.structure.printSize || ""}
                        onChange={handleChange}
                        size='small'
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Number of Color"
                        name={`structure.additional[${blockIndex}].structure.numberOfColor`}
                        value={silkScreen.structure.numberOfColor || 1}
                        onChange={handleChange}
                        size='small'
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Print Quantity"
                        name={`structure.additional[${blockIndex}].structure.quantity`}
                        value={silkScreen.structure.quantity || 0}
                        onChange={handleChange}
                        size='small'
                        disabled
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Cost Print"
                        name={`structure.additional[${blockIndex}].structure.costPrint`}
                        value={+silkScreen.structure.costPrint || 0}
                        onChange={handleChange}
                        size='small'
                    />
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2} sx={{ justifyContent: "end", alignItems: "end" }} direction="column">
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                label="Total Cost"
                                value={silkScreen.structure.totalCost || 0}
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

export default SilkScreenComponent;