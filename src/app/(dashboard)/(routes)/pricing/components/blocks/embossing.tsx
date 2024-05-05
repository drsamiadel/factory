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

const EmbossingComponent = ({ embossing, input, handleChange, initialValues }: { embossing: any, input: any, handleChange: any, initialValues?: any }) => {
    const blockIndex = input.structure.additional.findIndex((block: any) => block.id === embossing.id);

    const printSizeOptions = [{ id: 1, name: "100x70", value: 1 }, { id: 2, name: "50x70", value: 2 }, { id: 3, name: "50x35", value: 4 }];


    const currentPeice = embossing.peiceId;
    const currentPage = input.structure.additional.find((page: any) => page.peiceId === currentPeice && page.code === 1);
    const sheetsQuantity = currentPage ? currentPage.structure.sheetsQuantity : 0;

    React.useEffect(() => {
        function calculateQuantity() {
            if (currentPeice) {
                const quantity = sheetsQuantity * (printSizeOptions.find((size: any) => size.id === embossing.structure.paperSize)?.value || 0);
                handleChange({ target: { name: `structure.additional[${blockIndex}].structure.quantity`, value: quantity } }, true);
            }
        }

        calculateQuantity();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetsQuantity, currentPeice, embossing.structure.paperSize]);

    React.useEffect(() => {
        function calculateTotalCost() {
            const totalCost = (+embossing.structure.quantity / 1000) * (+embossing.structure.costPrint || 0) + (+embossing.structure.clicheCost || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.totalCost`, value: totalCost } }, true);
        }

        calculateTotalCost();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [embossing.structure.costPrint, embossing.structure.clicheCost, embossing.structure.quantity]);

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
                            value={embossing.peiceId ? embossing.peiceId : ""}
                            label="select a part"
                            name={`structure.additional[${blockIndex}].peiceId`}
                            onChange={(e: SelectChangeEvent) => handleChange(e)}
                        >
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
                        value={printSizeOptions.find((size: any) => size.id === embossing.structure.paperSize) || printSizeOptions[0]}
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
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="Print Size"
                        name={`structure.additional[${blockIndex}].structure.embossingSize`}
                        value={embossing.structure.embossingSize || ""}
                        onChange={handleChange}
                        size='small'
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="Embossing Quantity"
                        name={`structure.additional[${blockIndex}].structure.quantity`}
                        value={embossing.structure.quantity || 0}
                        onChange={handleChange}
                        size='small'
                        disabled
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="Cost First Print"
                        name={`structure.additional[${blockIndex}].structure.costPrint`}
                        value={+embossing.structure.costPrint || 0}
                        onChange={handleChange}
                        size='small'
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="Cliche Cost"
                        name={`structure.additional[${blockIndex}].structure.clicheCost`}
                        value={+embossing.structure.clicheCost || 0}
                        onChange={handleChange}
                        size='small'
                    />
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2} sx={{ justifyContent: "end", alignItems: "end" }} direction="column">
                        <Grid item xs={3}>
                            <TextField
                                fullWidth
                                label="Total Cost"
                                value={embossing.structure.totalCost || 0}
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

export default EmbossingComponent;