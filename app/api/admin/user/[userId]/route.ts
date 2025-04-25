import { NextResponse, NextRequest } from "next/server";
import {connect} from "@/lib/DB_Connect"
import { cookies } from "next/headers";
import User from "@/models/User.model";

