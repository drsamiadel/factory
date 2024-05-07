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

const DieCutFormComponent = ({ dieCut, input, handleChange, initialValues }: { dieCut: any, input: any, handleChange: any, initialValues?: any }) => {
    const blockIndex = input.structure.additional.findIndex((block: any) => block.id === dieCut.id);

    const printSizeOptions = [{ id: 1, name: "100x70", value: 1 }, { id: 2, name: "50x70", value: 2 }, { id: 3, name: "50x35", value: 4 }];


    const currentPeice = dieCut.peiceId;
    const currentPage = input.structure.additional.find((page: any) => page.peiceId === currentPeice && page.code === 1);
    const allPage = input.structure.additional.find((page: any) => page.peiceId === "all" && page.code === 1);
    const sheetsQuantity = currentPage ? currentPage.structure.sheetsQuantity : allPage ? allPage.structure.sheetsQuantity : 0;

    React.useEffect(() => {
        function calculateQuantity() {
            if (currentPeice) {
                const quantity = sheetsQuantity * (printSizeOptions.find((size: any) => size.id === dieCut.structure.dieCutSize)?.value || 0);
                handleChange({ target: { name: `structure.additional[${blockIndex}].structure.quantity`, value: quantity } }, true);
            }
        }

        calculateQuantity();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetsQuantity, currentPeice, dieCut.structure.dieCutSize]);

    React.useEffect(() => {
        function calculateCostDieCut() {
            const costFirstThousand = dieCut.structure.costFirstThousand || 0;
            const costNextThousand = dieCut.structure.costNextThousand || 0;
            const quantity = dieCut.structure.quantity || 0;
            const thousand = +(quantity / 1000).toFixed(2);

            let dieCutCost = 0;
            if (thousand >= 1) {
                dieCutCost = (thousand - 1) * +costNextThousand + +costFirstThousand;
            } else {
                dieCutCost = +costFirstThousand * thousand;
            }
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.dieCutCost`, value: dieCutCost.toFixed(2) } }, true);
        }

        function calculateFormCost() {
            const dieCutForm = dieCut.structure.dieCutForm || 0;
            const dieCutFormCost = dieCut.structure.dieCutFormCost || 0;
            const formCost = dieCutForm * dieCutFormCost;
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.formCost`, value: formCost.toFixed(2) } }, true);
        }

        function calculateTotalCost() {
            const dieCutCost = dieCut.structure.dieCutCost || 0;
            const formCost = dieCut.structure.formCost || 0;
            const totalCost = dieCutCost + formCost;
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.totalCost`, value: totalCost.toFixed(2) } }, true);
        }

        calculateCostDieCut();
        calculateFormCost();
        calculateTotalCost();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dieCut.structure.costFirstThousand, dieCut.structure.costNextThousand, dieCut.structure.quantity, dieCut.structure.dieCutForm, dieCut.structure.dieCutFormCost, dieCut.structure.dieCutCost, dieCut.structure.formCost]);

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
                            value={dieCut.peiceId ? dieCut.peiceId : "all"}
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
                        id="combo-for-dieCutSize"
                        options={printSizeOptions}
                        getOptionLabel={(option) => option.name}
                        renderOption={(props, option) => (
                            <ListItem {...props} key={option.id}> <ListItemText primary={option.name} /> </ListItem>
                        )}
                        value={printSizeOptions.find((size: any) => size.id === dieCut.structure.dieCutSize) || printSizeOptions[0]}
                        renderInput={(params) => <TextField {...params} label="Paper Size" />}
                        onChange={(event, value) => {
                            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.dieCutSize`, value: value ? value.id : null } });
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
                        label="Die Cut Quantity"
                        name={`structure.additional[${blockIndex}].structure.quantity`}
                        value={dieCut.structure.quantity || 0}
                        onChange={handleChange}
                        size='small'
                        disabled
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Cost First Die cut"
                        name={`structure.additional[${blockIndex}].structure.costFirstThousand`}
                        value={+dieCut.structure.costFirstThousand || 0}
                        onChange={handleChange}
                        size='small'
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Cost Second Die cut"
                        name={`structure.additional[${blockIndex}].structure.costNextThousand`}
                        value={+dieCut.structure.costNextThousand || 0}
                        onChange={handleChange}
                        size='small'
                    />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2} sx={{ justifyContent: "end", alignItems: "end" }} direction="column">
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                label="Die Cut Cost"
                                name={`structure.additional[${blockIndex}].structure.dieCutCost`}
                                value={+dieCut.structure.dieCutCost || 0}
                                onChange={handleChange}
                                size='small'
                                disabled
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Die Cut Form"
                        name={`structure.additional[${blockIndex}].structure.dieCutForm`}
                        value={+dieCut.structure.dieCutForm || 0}
                        onChange={handleChange}
                        size='small'
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Meter Cost"
                        name={`structure.additional[${blockIndex}].structure.dieCutFormCost`}
                        value={+dieCut.structure.dieCutFormCost || 0}
                        onChange={handleChange}
                        size='small'
                    />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2} sx={{ justifyContent: "end", alignItems: "end" }} direction="column">
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                label="Form Cost"
                                name={`structure.additional[${blockIndex}].structure.formCost`}
                                value={+dieCut.structure.formCost || 0}
                                onChange={handleChange}
                                size='small'
                                disabled
                            />
                        </Grid>
                    </Grid>
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
                                value={dieCut.structure.totalCost || 0}
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

export default DieCutFormComponent;