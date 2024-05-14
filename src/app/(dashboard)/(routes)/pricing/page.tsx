﻿"use client"

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Form from './components/form';

import Button from '@mui/material/Button';
import { CREATE, DELETE, UPDATE } from '@/actions/pricing';
import { Customer, Image as ImageType, Input, Pricing, User } from '@prisma/client';
import Skeleton from '@mui/material/Skeleton';

import { useDebounce } from "@/lib/use-debounce";
import DeleteBTN from './components/delete';
import { useReactToPrint } from 'react-to-print';
import { PanoramaFishEyeRounded, Preview, VisibilityRounded } from '@mui/icons-material';
import convertTextToEquation from '../../../../lib/convert-text-to-equation';


interface PricingWithUserAndCustomer extends Partial<Pricing> {
    user: Partial<User>;
    customer: Partial<Customer>;
    input: Partial<Input>;
}

interface HeadCell {
    id: string;
    label: string;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string },
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
    height: 40,
}));

const headCells: readonly HeadCell[] = [
    { id: 'code', label: 'Code' },
    { id: 'customer', label: 'Customer' },
    { id: 'input', label: 'Input' },
    { id: 'total', label: 'Total' },
    { id: 'createdAt', label: 'Date' },
    { id: 'actions', label: '' },
];

const StyledTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
    '&.MuiTableSortLabel-root': {
        color: 'white',
    },
    '&.MuiTableSortLabel-active': {
        color: 'white',
    },
    '&.MuiTableSortLabel-icon': {
        color: 'white',
    },
}));

export default function CustomizedTables() {
    const [page, setPage] = React.useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
    const [search, setSearch] = React.useState<string>("");
    const [rows, setRows] = React.useState<PricingWithUserAndCustomer[] | []>([]);
    const [open, setOpen] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(true);
    const [order, setOrder] = React.useState<Order>('desc');
    const [orderBy, setOrderBy] = React.useState<keyof PricingWithUserAndCustomer>('createdAt');

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof PricingWithUserAndCustomer,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedId("");
    };

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'n') {
                handleClickOpen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const debouncedSearch = useDebounce(search, 500);

    React.useEffect(() => {
        const fetchPricing = async () => {
            setLoading(true);
            const response = await fetch(`/api/data/pricing?filterByName=${debouncedSearch}&page=${page + 1}&limit=${rowsPerPage}&sorting=${orderBy}&order=${order}`);

            if (response.ok) {
                const data = await response.json();
                setRows(data.pricings);
            }

            setLoading(false);
        }

        fetchPricing();
    }, [debouncedSearch, page, rowsPerPage, orderBy, order]);


    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (searchedVal: string) => {
        setSearch(searchedVal);
    };

    const handleDelete = async (id: string) => {
        await DELETE(id).then((res) => {
            const updatedRows = rows.filter((row) => row.id !== res);
            setRows(updatedRows as PricingWithUserAndCustomer[]);
        }).catch((err) => {
            console.log(err);
        });
    };

    const handleCreate = async (data: any) => {
        const result = await CREATE(data);
        if ('error' in result) {
            throw new Error(result.error.message);
        } else {
            setRows((prev) => [...prev, result as PricingWithUserAndCustomer]);
        }
        return result;
    };

    const handleUpdate = async (data: any) => {
        const result = await UPDATE(data);
        if ('error' in result) {
            throw new Error(result.error.message);
        } else {
            const updatedRows = rows.map((row) => {
                if (row.id === result.id) {
                    return result as PricingWithUserAndCustomer;
                }
                return row;
            });
            setRows(updatedRows);
        }
    };

    const handleEdit = (id: string) => {
        setSelectedId(id);
        handleClickOpen();
    };

    const dataURLtoFile = (dataurl: string, filename: string) => {
        var arr = dataurl.split(','),
            mime = 'image/png',
            bstr = atob(arr[arr.length - 1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    const PreviewBtn = ({ input }: { input: PricingWithUserAndCustomer }) => {
        const contentToPrint = React.useRef(null);
        const handlePrint = useReactToPrint({
            content: () => contentToPrint.current,
        });

        const unitPrice = ((input.total || 0) / ((input.structure as any)?.sheetsQuantity || 1)).toFixed(2);

        return (
            <>
                <Button variant="outlined" onClick={handlePrint} sx={{ padding: 0, minWidth: 0, minHeight: 0, border: "none", backgroundColor: "transparent" }}>
                    <VisibilityRounded />
                </Button>
                <div style={{ display: "none" }}>
                    <div ref={contentToPrint}>
                        {input && (
                            <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "16px" }}>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                                        <h1 style={{ fontWeight: 600 }}>AL-ESTEQAMA PRINTING PRESS</h1>
                                        <p>AL-NAKHEEL SHARAH MALIK SAUD</p>
                                        <p>SHARAH MALIK SAUD - AL-DAMMAM</p>
                                        <p>0551971699 / 0138285068</p>
                                        <p>311165637900003</p>
                                        <p>CR: 2050102120</p>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "end" }}>
                                        <h1 style={{ fontWeight: 600 }}>تسعيرة</h1>
                                        <p style={{ fontWeight: 600 }}>{input.code} :رقم التسعير</p>
                                        <p>{input.customer.companyName}</p>
                                        <p>{input.customer.vatNumber} :الرقم الضريبي</p>
                                        <p>{new Date(input.createdAt as Date).toLocaleDateString()} :التاريخ المقدر</p>
                                    </div>
                                </div>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }}>
                                                <p>#</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }}>
                                                <p>البيان</p>
                                                <p>Description</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>الكمية</p>
                                                <p>Qty</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>سعر الوحدة</p>
                                                <p>Unit Price</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>المبلغ بدون ضريبة</p>
                                                <p>Amount Excluding VAT</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>مبلغ الضريبة</p>
                                                <p>Tax Amount</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>المجموع شامل الضريبة</p>
                                                <p>Total Including VAT</p>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ backgroundColor: "#f3f4f6" }}>
                                            <td style={{ border: "1px solid white", padding: "5px", textAlign: "left" }}>
                                                <p>1</p>
                                            </td>
                                            <td style={{ border: "1px solid white", padding: "5px", textAlign: "left" }}>
                                                <p style={{ fontWeight: 600 }}>{input.input.name}</p>
                                                <p>{input.input.code}</p>
                                                <p>with {(input?.structure as any)?.additional?.map((add: any) => add.name).join("& ")}</p>
                                            </td>
                                            <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                <p>{((input.structure) as any)?.sheetsQuantity}</p>
                                            </td>
                                            <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                <p>{unitPrice}</p>
                                            </td>
                                            <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                <p>{input.total}</p>
                                            </td>
                                            <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                <p>{((input.totalCost || 0) - (input.total || 0)).toFixed(2)}</p>
                                            </td>
                                            <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                <p>{input.totalCost}</p>
                                            </td>
                                        </tr>
                                        <tr style={{ backgroundColor: "#1f2937", color: "white" }}>
                                            <td style={{ border: "1px solid white", padding: "5px", textAlign: "left" }} colSpan={7}>
                                                Box Size
                                            </td>
                                        </tr>
                                        {(input?.structure as any)?.input?.structure?.peices.map((add: any) => {
                                            const width = convertTextToEquation(add.equation.width, (input?.structure as any)?.input, add.id);
                                            const height = convertTextToEquation(add.equation.height, (input?.structure as any)?.input, add.id);
                                            return (
                                                <>
                                                    <tr style={{ backgroundColor: "#f3f4f6" }} key={add.id}>
                                                        <td style={{ border: "1px solid white", padding: "5px", textAlign: "left" }} colSpan={5}>
                                                            <p>{add.name}</p>
                                                        </td>
                                                        <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} colSpan={1}>
                                                            width<p style={{ padding: 2, fontWeight: 500 }}>{add.equation.width}</p>
                                                        </td>
                                                        <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} colSpan={1}>
                                                            height<p style={{ padding: 2, fontWeight: 500 }}>{add.equation.height}</p>
                                                        </td>
                                                    </tr>
                                                    <tr style={{ backgroundColor: "#f3f4f6" }} key={add.id}>
                                                        <td style={{ border: "1px solid white", padding: "5px", textAlign: "left" }} colSpan={7}>
                                                            {add?.fields?.map((add: any) => (
                                                                <span key={add.id}>
                                                                    {add.name} [{add.key}]{"  "}<span style={{ padding: 2, fontWeight: 600 }}>{add.value}</span> |{"  "}
                                                                </span>
                                                            ))}
                                                        </td>
                                                    </tr>
                                                    <tr style={{ backgroundColor: "#e5e5e5" }} key={add.id}>
                                                        <td style={{ border: "1px solid white", padding: "5px", textAlign: "left" }} colSpan={4}>
                                                            Width: {width} mm
                                                        </td>
                                                        <td style={{ border: "1px solid white", padding: "5px", textAlign: "left" }} colSpan={3}>
                                                            Height: {height} mm
                                                        </td>
                                                    </tr>
                                                </>
                                            )
                                        })}
                                        <tr style={{ backgroundColor: "#1f2937", color: "white" }}>
                                            <td style={{ border: "1px solid white", padding: "5px", textAlign: "left" }} colSpan={7}>
                                                Additonal Details
                                            </td>
                                        </tr>
                                        {(input?.structure as any)?.additional?.map((add: any) => (
                                            <tr style={{ backgroundColor: "#d7d7d7" }} key={add.id}>
                                                <td style={{ border: "1px solid white", padding: "5px", textAlign: "left" }} colSpan={7}>
                                                    <p>{add.name}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "end", alignItems: "end" }}>
                                    <p style={{ fontWeight: 600 }}>المجموع بدون ضريبة: {input.totalCost}</p>
                                    <p style={{ fontWeight: 600 }}>الضريبة ({input.vat}%): {((input.totalCost || 0) * (input.vat || 0) / 100).toFixed(2)}</p>
                                    <p style={{ fontWeight: 600 }}>الخصم: {input.discount}</p>
                                    <p style={{ fontWeight: 600 }}>الإجمالي شامل الضريبة: {input.totalCost}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }

    const PrintBtn = ({ rows, code }: { rows: PricingWithUserAndCustomer[], code: string }) => {
        const contentToPrint = React.useRef(null);
        const handlePrint = useReactToPrint({
            content: () => contentToPrint.current,
        });

        const totalCost = rows.filter((row) => row.code === code).reduce((acc, row) => acc + (row.totalCost || 0), 0);
        const total = rows.filter((row) => row.code === code).reduce((acc, row) => acc + (row.total || 0), 0);
        const totalTaxAmount = rows.filter((row) => row.code === code).reduce((acc, row) => acc + (((row.totalCost as number) - (row.total as number)) || 0), 0);
        const totalDiscount = rows.filter((row) => row.code === code).reduce((acc, row) => acc + (row.discount || 0), 0);

        const currentRow = rows.find((row) => row.code === code);

        return (
            <>
                <Button variant="contained" onClick={handlePrint}>
                    Print
                </Button>
                <div style={{ display: "none" }}>
                    <div ref={contentToPrint}>
                        {rows.length > 0 && (
                            <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "16px" }}>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                                        <h1 style={{ fontWeight: 600 }}>AL-ESTEQAMA PRINTING PRESS</h1>
                                        <p>AL-NAKHEEL SHARAH MALIK SAUD</p>
                                        <p>SHARAH MALIK SAUD - AL-DAMMAM</p>
                                        <p>0551971699 / 0138285068</p>
                                        <p>311165637900003</p>
                                        <p>CR: 2050102120</p>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "end" }}>
                                        <h1 style={{ fontWeight: 600 }}>تسعيرة</h1>
                                        <p style={{ fontWeight: 600 }}>{currentRow?.code} :رقم التسعير</p>
                                        <p>{currentRow?.customer.companyName}</p>
                                        <p>{currentRow?.customer.vatNumber} :الرقم الضريبي</p>
                                        <p>{new Date(currentRow?.createdAt as Date).toLocaleDateString()} :التاريخ المقدر</p>
                                    </div>
                                </div>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} colSpan={6}>
                                                <p>#</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} colSpan={6}>
                                                <p>البيان</p>
                                                <p>Description</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>الكمية</p>
                                                <p>Qty</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>سعر الوحدة</p>
                                                <p>Unit Price</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>المبلغ بدون ضريبة</p>
                                                <p>Amount Excluding VAT</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>مبلغ الضريبة</p>
                                                <p>Tax Amount</p>
                                            </th>
                                            <th style={{ fontWeight: 400, border: "1px solid white", padding: "5px", backgroundColor: "#1f2937", color: "white", textAlign: "left" }} >
                                                <p>المجموع شامل الضريبة</p>
                                                <p>Total Including VAT</p>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.filter((row) => row.code === code).map((input, index) => {
                                            const unitPrice = ((input.total || 0) / ((input.structure as any)?.sheetsQuantity || 1)).toFixed(2);
                                            return (
                                                <tr style={{ backgroundColor: "#f3f4f6" }} key={input.id}>
                                                    <td style={{ border: "1px solid white", padding: "5px", textAlign: "left" }} colSpan={6}>
                                                        <p>{index + 1}</p>
                                                    </td>
                                                    <td style={{ border: "1px solid white", padding: "5px", textAlign: "left" }} colSpan={6}>
                                                        <p style={{ fontWeight: 600 }}>{input.input.name}</p>
                                                        <p>{input.input.code}</p>
                                                        <p>with {(input?.structure as any)?.additional?.map((add: any) => add.name).join("& ")}</p>
                                                    </td>
                                                    <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                        <p>{((input.structure) as any)?.sheetsQuantity}</p>
                                                    </td>
                                                    <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                        <p>{unitPrice}</p>
                                                    </td>
                                                    <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                        <p>{input.total}</p>
                                                    </td>
                                                    <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                        <p>{((input.totalCost || 0) - (input.total || 0)).toFixed(2)}</p>
                                                    </td>
                                                    <td style={{ border: "1px solid white", padding: "5px", textAlign: "right" }} >
                                                        <p>{input.totalCost}</p>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "end", alignItems: "end" }}>
                                    <p style={{ fontWeight: 600 }}>المجموع بدون ضريبة: {total}</p>
                                    <p style={{ fontWeight: 600 }}>الضريبة: {totalTaxAmount}</p>
                                    <p style={{ fontWeight: 600 }}>الخصم: {totalDiscount}</p>
                                    <p style={{ fontWeight: 600 }}>الإجمالي شامل الضريبة: {totalCost}</p>

                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }

    return (
        <Box
            component="div"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'end',
                width: '100%',
                gap: 3,
            }}
        >
            <Form onClose={handleClose} open={open} onSubmit={selectedId ? handleUpdate : handleCreate} initialValues={selectedId ? rows.find((row) => row.id === selectedId) : null} />
            <Box
                component="div"
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'end',
                    alignItems: 'center',
                    width: '100%',
                    gap: 1,
                }}
            >
                <TextField placeholder="Search" variant="outlined" value={search} onChange={(e) => { handleSearch(e.target.value) }} sx={{
                    [`& input`]: {
                        height: "37px",
                        padding: "0 14px",
                    },
                }}
                />
                <Button variant="contained" sx={{ textWrap: "nowrap" }} onClick={handleClickOpen}>
                    Add Pricing [N]
                </Button>
            </Box>
            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table" size={'small'}>
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <StyledTableCell
                                    key={headCell.id}
                                    align={headCell.id === 'peices' || headCell.id === 'createdAt' ? 'right' : 'left'}
                                    sortDirection={orderBy === headCell.id ? order : false}
                                >
                                    {headCell.id === 'name' || headCell.id === 'code' || headCell.id === 'createdAt' ? (
                                        <StyledTableSortLabel
                                            sx={{ "&.MuiTableSortLabel-root": { color: "white" }, "&.MuiTableSortLabel-active": { color: "white" }, "&.MuiTableSortLabel-icon": { color: "white" } }}
                                            active={orderBy === headCell.id}
                                            direction={orderBy === headCell.id ? order : 'asc'}
                                            onClick={(event) => handleRequestSort(event, headCell.id as keyof PricingWithUserAndCustomer)}
                                            disabled={loading}
                                        >
                                            {headCell.label}
                                        </StyledTableSortLabel>
                                    ) : (
                                        headCell.label
                                    )}
                                </StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <StyledTableRow>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell sx={{ display: 'flex', gap: 2, flexDirection: "row", justifyContent: "end", alignItems: "center" }}>
                                    <Skeleton variant="circular" width={35} height={35} />
                                    <Skeleton variant="circular" width={35} height={35} />
                                </StyledTableCell>
                            </StyledTableRow>
                        ) : rows.length === 0 ?
                            <StyledTableRow>
                                <StyledTableCell colSpan={5} align="center">No data found</StyledTableCell>
                            </StyledTableRow>
                            :
                            rows.map((row) => (
                                <StyledTableRow key={row.id}>
                                    <StyledTableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', gap: 2, flexDirection: "row", justifyContent: "start", alignItems: "center" }}>
                                            {row.code}
                                            <PreviewBtn input={row} />
                                        </Box>
                                    </StyledTableCell>
                                    <StyledTableCell>{row.customer.companyName}</StyledTableCell>
                                    <StyledTableCell>{row.input.name}</StyledTableCell>
                                    <StyledTableCell>{row.totalCost}</StyledTableCell>
                                    <StyledTableCell align="right">
                                        {new Date(row.createdAt as Date).toLocaleString()}
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 1, flexDirection: "row", justifyContent: "end", alignItems: "center" }}>
                                            <PrintBtn rows={rows} code={row.code as string} />
                                            <IconButton aria-label="edit" sx={{ color: "success.main", p: 0 }} onClick={() => handleEdit(row.id!)}>
                                                <EditRoundedIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                            <DeleteBTN onAgree={() => handleDelete(row.id!)} />
                                        </Box>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
}
