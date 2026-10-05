import { cache } from "react";
import { prisma } from "./db";
export const getUnreadInquiryCount = cache(() => prisma.contactInquiry.count({ where: { isRead: false } }));
