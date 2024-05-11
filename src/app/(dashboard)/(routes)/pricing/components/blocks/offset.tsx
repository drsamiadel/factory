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

const OffsetComponent = ({ offset, input, handleChange, initialValues }: { offset: any, input: any, handleChange: any, initialValues?: any }) => {
    const blockIndex = input.structure.additional.findIndex((block: any) => block.id === offset.id);

    const printSizeOptions = [{ id: 1, name: "100x70", value: 1 }, { id: 2, name: "50x70", value: 2 }, { id: 3, name: "50x35", value: 4 }];


    const currentPeice = offset.peiceId;
    const currentPage = input.structure.additional.find((page: any) => page.peiceId === currentPeice && page.code === 1);
    const allPage = input.structure.additional.find((page: any) => page.peiceId === "all" && page.code === 1);
    const sheetsQuantity = currentPage ? currentPage.structure.sheetsQuantity : allPage ? allPage.structure.sheetsQuantity : 0;

    React.useEffect(() => {
        function calculateQuantity() {
            if (currentPeice) {
                const quantity = sheetsQuantity * (printSizeOptions.find((size: any) => size.id === offset.structure.printSize)?.value || 0);
                handleChange({ target: { name: `structure.additional[${blockIndex}].structure.quantity`, value: quantity < 1000 ? 1000 : quantity } }, true);
            }
        }

        calculateQuantity();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetsQuantity, currentPeice, offset.structure.printSize]);

    React.useEffect(() => {
        function calculateCostFront() {
            const costFirstThousand = offset.structure.faces[0].costFirstThousand || 0;
            const costNextThousand = offset.structure.faces[0].costNextThousand || 0;
            const quantity = offset.structure.quantity || 0;
            const thousand = +(quantity / 1000).toFixed(2);
            let totalCost = 0;
            if (thousand >= 1) {
                totalCost = (thousand - 1) * +costNextThousand + +costFirstThousand;
            } else {
                totalCost = +costFirstThousand * thousand;
            }
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[0].totalCost`, value: totalCost } }, true);
        }

        function calculateCostBack() {
            const costFirstThousand = offset.structure.faces[1].costFirstThousand || 0;
            const costNextThousand = offset.structure.faces[1].costNextThousand || 0;
            const quantity = offset.structure.quantity || 0;
            const thousand = +(quantity / 1000).toFixed(2);
            let totalCost = 0;
            if (thousand >= 1) {
                totalCost = (thousand - 1) * +costNextThousand + +costFirstThousand;
            } else {
                totalCost = +costFirstThousand * thousand;
            }
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[1].totalCost`, value: totalCost } }, true);
        }

        function calculateTotalCost() {
            const totalCost = (offset.structure.faces[0].active ? offset.structure.faces[0].totalCost : 0) + (offset.structure.faces[1].active ? offset.structure.faces[1].totalCost : 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.totalCost`, value: totalCost } }, true);
        }

        calculateCostFront();
        calculateCostBack();
        calculateTotalCost();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offset.structure.faces[0].costFirstThousand, offset.structure.faces[0].costNextThousand, offset.structure.faces[1].costFirstThousand, offset.structure.faces[1].costNextThousand, offset.structure.quantity]);


    return (
        <Grid item xs={12}>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <Autocomplete
                        id="combo-for-printSize"
                        options={printSizeOptions}
                        getOptionLabel={(option) => option.name}
                        renderOption={(props, option) => (
                            <ListItem {...props} key={option.id}> <ListItemText primary={option.name} /> </ListItem>
                        )}
                        value={printSizeOptions.find((size: any) => size.id === offset.structure.printSize) || printSizeOptions[0]}
                        renderInput={(params) => <TextField {...params} label="Print Size" />}
                        onChange={(event, value) => {
                            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.printSize`, value: value ? value.id : null } });
                        }}
                        size='small'
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                </Grid>
                <Grid item xs={!!offset.structure.faces[0].active || !!offset.structure.faces[1].active ? 12 : 0} />
                <Grid item xs={2.5}>
                    <Checkbox checked={offset.structure.faces[0].active} onChange={(e) => handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[0].active`, value: e.target.checked } })} />
                    {offset.structure.faces[0].name}
                </Grid>
                {!!offset.structure.faces[0].active && (
                    <>
                        <Grid item xs={2}>
                            <Autocomplete
                                id="combo-for-colorType"
                                options={["CMYK", "PANTON"]}
                                getOptionLabel={(option) => option.toString()}
                                renderOption={(props, option) => (
                                    <ListItem {...props} key={option}> <ListItemText primary={option} /> </ListItem>
                                )}
                                renderInput={(params) => <TextField {...params} label="Color Type" />}
                                onChange={(event, value) => {
                                    handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[0].colorType`, value: value ? value : null } });
                                }}
                                size='small'
                                value={offset.structure.faces[0].colorType || ""}
                                disabled={!!!offset.structure.faces[0].active}
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Number of Color"
                                name={`structure.additional[${blockIndex}].structure.faces[0].numberOfColor`}
                                value={offset.structure.faces[0].numberOfColor || ""}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!offset.structure.faces[0].active}
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Print Quantity"
                                name={`structure.additional[${blockIndex}].structure.quantity`}
                                value={offset.structure.quantity || 0}
                                onChange={handleChange}
                                size='small'
                                disabled
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Cost First Print"
                                name={`structure.additional[${blockIndex}].structure.faces[0].costFirstThousand`}
                                value={+offset.structure.faces[0].costFirstThousand || 0}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!offset.structure.faces[0].active}
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Cost Second Print"
                                name={`structure.additional[${blockIndex}].structure.faces[0].costNextThousand`}
                                value={+offset.structure.faces[0].costNextThousand || 0}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!offset.structure.faces[0].active}
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Cost"
                                value={offset.structure.faces[0].totalCost || 0}
                                onChange={(e) => handleChange(e)}
                                disabled
                                size='small'
                            />
                        </Grid>
                    </>
                )}
                <Grid item xs={!!offset.structure.faces[0].active || !!offset.structure.faces[1].active ? 12 : 0}>
                </Grid>
                <Grid item xs={2.5}>
                    <Checkbox checked={offset.structure.faces[1].active} onChange={(e) => handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[1].active`, value: e.target.checked } })} />
                    {offset.structure.faces[1].name}
                </Grid>
                {!!offset.structure.faces[1].active && (
                    <>
                        <Grid item xs={2}>
                            <Autocomplete
                                id="combo-for-colorType"
                                options={["CMYK", "PANTON"]}
                                getOptionLabel={(option) => option.toString()}
                                renderOption={(props, option) => (
                                    <ListItem {...props} key={option}> <ListItemText primary={option} /> </ListItem>
                                )}
                                renderInput={(params) => <TextField {...params} label="Color Type" />}
                                onChange={(event, value) => {
                                    handleChange({ target: { name: `structure.additional[${blockIndex}].structure.faces[1].colorType`, value: value ? value : null } });
                                }}
                                size='small'
                                value={offset.structure.faces[1].colorType}
                                disabled={!!!offset.structure.faces[1].active}
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Number of Color"
                                name={`structure.additional[${blockIndex}].structure.faces[1].numberOfColor`}
                                value={offset.structure.faces[1].numberOfColor || ""}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!offset.structure.faces[1].active}
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Print Quantity"
                                name={`structure.additional[${blockIndex}].structure.quantity`}
                                value={offset.structure.quantity || 0}
                                onChange={handleChange}
                                size='small'
                                disabled
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Cost First Print"
                                name={`structure.additional[${blockIndex}].structure.faces[1].costFirstThousand`}
                                value={+offset.structure.faces[1].costFirstThousand || 0}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!offset.structure.faces[1].active}
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Cost Second Print"
                                name={`structure.additional[${blockIndex}].structure.faces[1].costNextThousand`}
                                value={+offset.structure.faces[1].costNextThousand || 0}
                                onChange={handleChange}
                                size='small'
                                disabled={!!!offset.structure.faces[1].active}
                            />
                        </Grid>
                        <Grid item xs={1.5}>
                            <TextField
                                fullWidth
                                label="Cost"
                                value={offset.structure.faces[1].totalCost || 0}
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
                                value={offset.structure.totalCost || 0}
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

export default OffsetComponent;