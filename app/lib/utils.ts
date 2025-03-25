import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const itemMap: Record<string, string[]> = {
    '10-K': [
        'item_1', 'item_1A', 'item_1B', 'item_1C', 'item_2', 'item_3', 'item_4',
        'item_5', 'item_6', 'item_7', 'item_7A', 'item_8',
        'item_9', 'item_9A', 'item_9B', 'item_9C',
        'item_10', 'item_11', 'item_12', 'item_13', 'item_14',
        'item_15', 'item_16', 'SIGNATURE'
    ],
    '8-K': [
        'item_1.01', 'item_1.02', 'item_1.03', 'item_1.04', 'item_1.05',
        'item_2.01', 'item_2.02', 'item_2.03', 'item_2.04', 'item_2.05', 'item_2.06',
        'item_3.01', 'item_3.02', 'item_3.03',
        'item_4.01', 'item_4.02',
        'item_5.01', 'item_5.02', 'item_5.03', 'item_5.04', 'item_5.05', 'item_5.06', 'item_5.07', 'item_5.08',
        'item_6.01', 'item_6.02', 'item_6.03', 'item_6.04', 'item_6.05',
        'item_7.01', 'item_8.01', 'item_9.01',
        'SIGNATURE'
    ],
    '8-K-OBSOLETE': [
        'item_1', 'item_2', 'item_3', 'item_4', 'item_5', 'item_6',
        'item_7', 'item_8', 'item_9', 'item_10', 'item_11', 'item_12', 'SIGNATURE'
    ],
    '10-Q': [
        'item_part_1_1', 'item_part_1_2', 'item_part_1_3', 'item_part_1_4',
        'item_part_2_1', 'item_part_2_1A', 'item_part_2_2', 'item_part_2_3',
        'item_part_2_4', 'item_part_2_5', 'item_part_2_6', 'SIGNATURE'
    ],
    'OTHER': ['content']
};
