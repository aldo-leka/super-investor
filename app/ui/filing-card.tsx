'use client';

import { useState } from "react";
import { Filing } from "../lib/definitions";
import { Button, Card, CardContent, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from 'next/navigation';

export default function FilingCard({ category, filings }: { category: string, filings: Filing[] }) {
    const [showMore, setShowMore] = useState(false);
    const displayFilings = showMore ? filings : filings.slice(0, 5);
    const router = useRouter();

    const handleRowClick = (ticker: string, accessionNumber: string) => {
        router.push(`/${ticker}/${accessionNumber}`);
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                    {category}
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableBody>
                            {displayFilings.map((filing, index) => (
                                <TableRow
                                    key={index}
                                    hover
                                    onClick={() => handleRowClick(filing.ticker, filing.accessionNumber)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>
                                        {filing.form}
                                    </TableCell>
                                    <TableCell>
                                        {filing.filingDate}
                                    </TableCell>
                                    <TableCell>
                                        {filing.primaryDocument}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {filings.length > 5 && (
                    <Button
                        onClick={() => setShowMore(!showMore)}
                        startIcon={<ExpandMoreIcon />}
                        fullWidth
                    >
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}