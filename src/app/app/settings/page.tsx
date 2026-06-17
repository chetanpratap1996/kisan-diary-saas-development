"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { t, Language, LANGUAGES } from "@/lib/translations";
import {
  LogOut, Globe, Phone, MapPin, Shield, HelpCircle, Plus, CheckCircle2,
  Sprout, Tractor, ChevronRight, Settings, AlertTriangle, Save, Play,
  Crown, Pencil, X, Check, Bell, BellOff, BarChart3, Lock, KeyRound,
  Eye, EyeOff, Wheat, Droplets, Package, HandCoins, FileText,
  Home, Building2, TreePine, ChevronDown, RefreshCw, Trash2,
  ShieldCheck, Info, BadgeCheck, ScanLine
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import VoiceInput from "@/components/ui/VoiceInput";

// ─── Constants ─────────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry",
];

const LAND_TYPES = [
  { value: "owned", label: "अपनी ज़मीन (Owned)" },
  { value: "leased", label: "किराये की ज़मीन (Leased)" },
  { value: "ancestral", label: "पुश्तैनी ज़मीन (Ancestral)" },
];

const IRRIGATION_SOURCES = [
  { value: "borewell", label: "बोरवेल (Borewell)" },
  { value: "canal", label: "नहर (Canal)" },
  { value: "rain-fed", label: "बारिश पर निर्भर (Rain-fed)" },
  { value: "drip", label: "ड्रिप सिंचाई (Drip Irrigation)" },
  { value: "pond", label: "तालाब (Pond/Tank)" },
];

const SOIL_TYPES = [
  { value: "black", label: "काली मिट्टी (Black Soil)" },
  { value: "red", label: "लाल मिट्टी (Red Soil)" },
  { value: "sandy", label: "रेतीली मिट्टी (Sandy)" },
  { value: "clay", label: "चिकनी मिट्टी (Clay)" },
  { value: "alluvial", label: "दोमट मिट्टी (Alluvial/Loamy)" },
];

const UNIT_OPTIONS = [
  { value: "acre", label: "एकड़ (Acre)" },
  { value: "bigha", label: "बीघा (Bigha)" },
  { value: "hectare", label: "हेक्टेयर (Hectare)" },
];

// Conversion from acre to display unit
function convertFromAcre(acres: number, unit: string): string {
  if (unit === "bigha") return (acres * 1.6).toFixed(2);
  if (unit === "hectare") return (acres * 0.405).toFixed(2);
  return acres.toString();
}

// Conversion to acre from display unit
function convertToAcre(value: number, unit: string): number {
  if (unit === "bigha") return value / 1.6;
  if (unit === "hectare") return value / 0.405;
  return value;
}

const NOTIF_DEFAULTS = {
  mandi: true,
  weather: true,
  borrowing: true,
  daily: true,
  stock: true,
};

type NotifPrefs = typeof NOTIF_DEFAULTS;

// ─── Section Label ──────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-1 mb-2.5">
      {children}
    </h4>
  );
}

// ─── Inline Editable Field ─────────────────────────────────────────────────────
function EditableField({
  label,
  value,
  placeholder,
  icon: Icon,
  fieldKey,
  editingField,
  onStartEdit,
  onSave,
  onCancel,
  readOnly,
  type = "text",
  renderDisplay,
  children,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: React.ElementType;
  fieldKey: string;
  editingField: string | null;
  onStartEdit: (key: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  readOnly?: boolean;
  type?: string;
  renderDisplay?: (val: string) => string;
  children?: React.ReactNode;
}) {
  const isEditing = editingField === fieldKey;
  const displayValue = renderDisplay ? renderDisplay(value) : value;

  return (
    <div className={`transition-all duration-200 ${isEditing ? "bg-slate-50 rounded-2xl p-3 -mx-1" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isEditing ? "bg-emerald-100" : "bg-slate-100"}`}>
            <Icon size={17} className={isEditing ? "text-emerald-700" : "text-slate-500"} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            {isEditing ? (
              children || (
                <Input
                  type={type}
                  autoFocus
                  defaultValue={value}
                  onChange={(e) => onStartEdit(fieldKey, e.target.value)}
                  placeholder={placeholder}
                  className="h-9 bg-white border-emerald-200 focus-visible:ring-emerald-500 rounded-xl text-sm font-medium mt-1 px-3"
                />
              )
            ) : (
              <p className={`text-sm font-semibold mt-0.5 truncate ${value ? "text-slate-800" : "text-slate-400 italic"}`}>
                {displayValue || placeholder}
              </p>
            )}
          </div>
        </div>

        {!readOnly && (
          isEditing ? (
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                onClick={onSave}
                className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm hover:bg-emerald-600 active:scale-95 transition-all"
              >
                <Check size={15} strokeWidth={3} />
              </button>
              <button
                onClick={onCancel}
                className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 active:scale-95 transition-all"
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onStartEdit(fieldKey, value)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95 transition-all flex-shrink-0"
            >
              <Pencil size={14} strokeWidth={2.5} />
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ─── Profile Section ─────────────────────────────────────────────────────────
function ProfileSection() {
  const { user, updateUser, apiCall, language } = useApp();
  const lang = language;

  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldDraft, setFieldDraft] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (!user) return null;

  const startEdit = (key: string, current: string) => {
    setEditingField(key);
    setFieldDraft(current);
    setSaveError("");
  };

  const cancelEdit = () => {
    setEditingField(null);
    setFieldDraft("");
    setSaveError("");
  };

  const saveField = async () => {
    if (!editingField) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const body: Record<string, any> = { [editingField]: fieldDraft || null };

      if (editingField === "pincode" && fieldDraft && fieldDraft.length === 6) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${fieldDraft}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const po = data[0].PostOffice[0];
            body.district = po.District;
            body.state = po.State;
            if (!user.village) {
              body.village = po.Name;
            }
          }
        } catch (err) {
          console.error("Failed to fetch pincode details", err);
        }
      }

      const result = await apiCall<{ success: boolean; data: any }>("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify(body),
      });
      if (result.success) {
        updateUser({ ...body } as any);
        setEditingField(null);
      }
    } catch (e: any) {
      setSaveError(e?.message || "सहेजने में विफल");
    } finally {
      setIsSaving(false);
    }
  };

  const trustScore = null; // fetched separately, just link to credit page

  const fieldProps = {
    editingField,
    onStartEdit: (key: string, val: string) => {
      setFieldDraft(val);
      setEditingField(key);
    },
    onSave: saveField,
    onCancel: cancelEdit,
  };

  return (
    <Card className="p-1 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
      <div className="bg-white rounded-[20px] p-5">
        {/* Avatar + Badge Row */}
        <div className="flex items-center gap-5 border-b border-slate-100 pb-5 mb-5">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 rounded-full flex items-center justify-center text-3xl font-black shadow-inner border-4 border-white ring-2 ring-emerald-100">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-2 -right-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
              <Crown size={12} strokeWidth={3} fill="currentColor" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight truncate">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-2.5 py-1 rounded-lg border border-amber-200/60 text-amber-700 text-xs font-bold uppercase tracking-wider">
                <Crown size={11} strokeWidth={3} fill="currentColor" /> Kisan Pro
              </span>
              <span className="text-slate-400 text-xs font-medium truncate">{user.phone}</span>
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">

          <EditableField
            label="पूरा नाम"
            value={user.name}
            placeholder="अपना नाम डालें"
            icon={BadgeCheck}
            fieldKey="name"
            type="text"
            {...fieldProps}
          />

          {/* Mobile - read only */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Phone size={17} className="text-slate-500" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">मोबाइल नंबर</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{user.phone}</p>
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center">
              <ShieldCheck size={14} className="text-emerald-500" />
            </div>
          </div>

          <EditableField
            label="पिन कोड (PIN Code)"
            value={user.pincode || ""}
            placeholder="6 अंकों का पिन कोड"
            icon={MapPin}
            fieldKey="pincode"
            type="text"
            {...fieldProps}
          />

          <EditableField
            label="जिला (District)"
            value={user.district || ""}
            placeholder="अपना जिला लिखें"
            icon={Building2}
            fieldKey="district"
            {...fieldProps}
          />

          <EditableField
            label="गाँव/कस्बा (Village)"
            value={user.village || ""}
            placeholder="गाँव का नाम लिखें"
            icon={TreePine}
            fieldKey="village"
            {...fieldProps}
          />

          <div className={`transition-all duration-200 ${editingField === "state" ? "bg-slate-50 rounded-2xl p-3 -mx-1" : ""}`}>
            <EditableField
              label="राज्य (State)"
              value={user.state}
              placeholder="राज्य चुनें"
              icon={Home}
              fieldKey="state"
              renderDisplay={(v) => v || "—"}
              {...fieldProps}
            >
              {editingField === "state" && (
                <Select
                  value={fieldDraft}
                  onValueChange={(v) => setFieldDraft(v)}
                >
                  <SelectTrigger className="h-9 bg-white border-emerald-200 rounded-xl text-sm font-medium mt-1 focus:ring-emerald-500">
                    <SelectValue placeholder="राज्य चुनें" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-60">
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s} className="text-sm font-medium">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </EditableField>
          </div>
        </div>

        {/* PM Kisan ID (Optional) */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-orange-50 rounded-lg flex items-center justify-center">
              <ScanLine size={14} className="text-orange-600" strokeWidth={2} />
            </div>
            <p className="text-sm font-bold text-slate-700">PM Kisan ID</p>
            <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">वैकल्पिक</span>
          </div>
          <EditableField
            label="PM Kisan रजिस्ट्रेशन ID"
            value={user.pmKisanId || ""}
            placeholder="ID नंबर डालें (अगर है)"
            icon={FileText}
            fieldKey="pmKisanId"
            {...fieldProps}
          />
          {!user.pmKisanId && (
            <p className="text-xs text-slate-400 mt-2 leading-relaxed ml-12">
              PM Kisan ID होने पर सरकारी योजनाओं का मिलान बेहतर होगा।
            </p>
          )}
        </div>

        {saveError && (
          <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 text-sm">
            <AlertTriangle size={14} /> {saveError}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Farms Manager ─────────────────────────────────────────────────────────────
function FarmsManager() {
  const { farms, activeFarm, setActiveFarm, setActiveSeason, apiCall, refreshFarms, language } = useApp();
  const lang = language;

  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState<any | null>(null);
  const [confirmDeleteFarm, setConfirmDeleteFarm] = useState<any | null>(null);
  const [showAddSeasonModal, setShowAddSeasonModal] = useState<{ farmId: string; farmName: string } | null>(null);
  const [confirmCompleteSeason, setConfirmCompleteSeason] = useState<{ farmId: string; seasonId: string; cropName: string } | null>(null);

  // Read land unit preference
  const [unitPref] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("kisan_unit_pref") || "acre";
    return "acre";
  });

  // Add Farm form
  const [farmName, setFarmName] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [farmLandType, setFarmLandType] = useState("");
  const [farmIrrigationSource, setFarmIrrigationSource] = useState("");
  const [farmSoilType, setFarmSoilType] = useState("");
  const [isAddingFarm, setIsAddingFarm] = useState(false);
  const [farmError, setFarmError] = useState("");

  // Add Season form
  const [cropName, setCropName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [isAddingSeason, setIsAddingSeason] = useState(false);
  const [seasonError, setSeasonError] = useState("");

  const handleSelectFarm = (farm: any) => {
    setActiveFarm(farm);
    if (farm.activeSeason) setActiveSeason(farm.activeSeason);
    else setActiveSeason(null);
  };

  const handleAddFarm = async () => {
    if (!farmName || !farmSize || !farmLocation) {
      setFarmError("खेत का नाम, आकार और स्थान जरूरी है।");
      return;
    }
    setIsAddingFarm(true);
    setFarmError("");
    try {
      const sizeInAcres = convertToAcre(parseFloat(farmSize), unitPref);
      await apiCall("/api/farms", {
        method: "POST",
        body: JSON.stringify({
          name: farmName,
          sizeAcre: sizeInAcres,
          location: farmLocation,
          landType: farmLandType || undefined,
          irrigationSource: farmIrrigationSource || undefined,
          soilType: farmSoilType || undefined,
        }),
      });
      setShowAddFarmModal(false);
      setFarmName(""); setFarmSize(""); setFarmLocation("");
      setFarmLandType(""); setFarmIrrigationSource(""); setFarmSoilType("");
      await refreshFarms();
    } catch {
      setFarmError("खेत जोड़ने में गड़बड़ी हुई। फिर कोशिश करें।");
    } finally {
      setIsAddingFarm(false);
    }
  };

  const handleEditFarm = async () => {
    if (!editingFarm) return;
    try {
      const sizeInAcres = convertToAcre(parseFloat(editingFarm.sizeAcre), unitPref);
      await apiCall(`/api/farms/${editingFarm.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editingFarm.name,
          sizeAcre: sizeInAcres,
          location: editingFarm.location,
          landType: editingFarm.landType || undefined,
          irrigationSource: editingFarm.irrigationSource || undefined,
          soilType: editingFarm.soilType || undefined,
        }),
      });
      setEditingFarm(null);
      await refreshFarms();
    } catch {
      setFarmError("खेत अपडेट करने में विफल।");
    }
  };

  const handleDeleteFarm = async () => {
    if (!confirmDeleteFarm) return;
    try {
      await apiCall(`/api/farms/${confirmDeleteFarm.id}`, { method: "DELETE" });
      setConfirmDeleteFarm(null);
      if (activeFarm?.id === confirmDeleteFarm.id) {
        setActiveFarm(null);
        setActiveSeason(null);
      }
      await refreshFarms();
    } catch {
      // ignore
    }
  };

  const handleAddSeason = async () => {
    if (!showAddSeasonModal?.farmId || !cropName || !startDate) {
      setSeasonError("फसल का नाम और तारीख जरूरी है।");
      return;
    }
    setIsAddingSeason(true);
    setSeasonError("");
    try {
      await apiCall(`/api/farms/${showAddSeasonModal.farmId}/seasons`, {
        method: "POST",
        body: JSON.stringify({ cropName, startDate }),
      });
      setShowAddSeasonModal(null);
      setCropName("");
      await refreshFarms();
    } catch {
      setSeasonError("फसल शुरू करने में विफल।");
    } finally {
      setIsAddingSeason(false);
    }
  };

  const handleCompleteSeason = async () => {
    if (!confirmCompleteSeason) return;
    try {
      await apiCall(`/api/seasons/${confirmCompleteSeason.seasonId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "completed", endDate: new Date().toISOString().split("T")[0] }),
      });
      setConfirmCompleteSeason(null);
      await refreshFarms();
    } catch {
      // ignore
    }
  };

  const unitLabel = UNIT_OPTIONS.find((u) => u.value === unitPref)?.label?.split(" ")[0] || "एकड़";

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
          <div className="bg-emerald-100 p-1.5 rounded-xl">
            <Tractor size={17} className="text-emerald-700" />
          </div>
          मेरे खेत
          <span className="text-xs font-medium text-slate-400">({farms.length})</span>
        </h3>
        <Button
          size="sm"
          onClick={() => setShowAddFarmModal(true)}
          className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 font-bold text-xs shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Plus size={15} strokeWidth={2.5} /> नया खेत
        </Button>
      </div>

      <div className="space-y-4">
        {farms.length === 0 ? (
          <Card className="p-8 text-center border-2 border-dashed border-slate-200 bg-slate-50/50 shadow-none rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Tractor className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
            </div>
            <h4 className="text-slate-800 font-bold mb-1">कोई खेत नहीं</h4>
            <p className="text-slate-500 text-sm mb-4 max-w-xs mx-auto">पहला खेत जोड़ें और खेती का हिसाब शुरू करें।</p>
            <Button onClick={() => setShowAddFarmModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6">
              <Plus size={15} className="mr-2" /> पहला खेत जोड़ें
            </Button>
          </Card>
        ) : (
          farms.map((farm) => {
            const isActive = activeFarm?.id === farm.id;
            return (
              <Card
                key={farm.id}
                className={`overflow-hidden border-2 transition-all duration-300 rounded-2xl ${isActive
                  ? "border-emerald-500 shadow-md shadow-emerald-500/10"
                  : "border-slate-100 shadow-sm hover:border-emerald-200"}`}
              >
                {/* Farm header */}
                <div
                  className={`p-4 cursor-pointer transition-colors ${isActive ? "bg-gradient-to-r from-emerald-50/80 to-transparent" : "bg-white"}`}
                  onClick={() => handleSelectFarm(farm)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h3 className="font-bold text-slate-800 text-base">{farm.name}</h3>
                        {isActive && (
                          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={11} strokeWidth={3} /> चयनित
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 text-sm flex-wrap">
                        <span className="flex items-center gap-1"><MapPin size={13} /> {farm.location}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="font-semibold text-slate-700">
                          {convertFromAcre(farm.sizeAcre, unitPref)} {unitLabel}
                        </span>
                      </div>
                      {/* Farm detail badges */}
                      {(farm.landType || farm.irrigationSource || farm.soilType) && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {farm.landType && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                              {LAND_TYPES.find(l => l.value === farm.landType)?.label?.split("(")[0]?.trim() || farm.landType}
                            </span>
                          )}
                          {farm.irrigationSource && (
                            <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-full font-medium">
                              <Droplets size={9} className="inline mr-0.5" />
                              {IRRIGATION_SOURCES.find(i => i.value === farm.irrigationSource)?.label?.split("(")[0]?.trim() || farm.irrigationSource}
                            </span>
                          )}
                          {farm.soilType && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-medium">
                              {SOIL_TYPES.find(s => s.value === farm.soilType)?.label?.split("(")[0]?.trim() || farm.soilType}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Edit / Delete buttons */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingFarm({ ...farm }); }}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 flex items-center justify-center active:scale-95 transition-all"
                      >
                        <Pencil size={14} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteFarm(farm); }}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 flex items-center justify-center active:scale-95 transition-all"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Season footer */}
                <div className={`px-4 py-3 border-t ${isActive ? "bg-emerald-50/30 border-emerald-100" : "bg-slate-50 border-slate-100"}`}>
                  {farm.activeSeason ? (
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 flex-shrink-0">
                          <Sprout size={18} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">चालू फसल</p>
                          <p className="font-bold text-slate-800 text-sm">{farm.activeSeason.cropName}</p>
                          <p className="text-[10px] text-slate-500">{formatDate(farm.activeSeason.startDate)} से</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmCompleteSeason({ farmId: farm.id, seasonId: farm.activeSeason!.id, cropName: farm.activeSeason!.cropName });
                        }}
                        className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 active:scale-95 transition-all"
                      >
                        ✓ फसल पूरी करें
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100/50">
                        <AlertTriangle size={13} strokeWidth={2.5} />
                        <span className="text-xs font-bold">कोई फसल नहीं</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setShowAddSeasonModal({ farmId: farm.id, farmName: farm.name }); }}
                        className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-3 font-bold active:scale-95 transition-all"
                      >
                        <Plus size={13} className="mr-1" /> फसल शुरू करें
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ── Add Farm Modal ──────────────────────────────────────── */}
      <Dialog open={showAddFarmModal} onOpenChange={setShowAddFarmModal}>
        <DialogContent className="max-w-md mx-auto p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl font-black text-white m-0">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
                  <Tractor className="w-6 h-6 text-white" />
                </div>
                नया खेत जोड़ें
              </DialogTitle>
            </DialogHeader>
            <p className="text-emerald-100 text-sm mt-1.5 opacity-90">खेत की जानकारी भरें</p>
          </div>
          <div className="p-5 bg-white space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">खेत का नाम *</label>
              <Input placeholder="जैसे: घर वाला खेत" value={farmName} onChange={(e) => setFarmName(e.target.value)} className="h-11 bg-slate-50 border-slate-200 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">क्षेत्रफल ({unitLabel}) *</label>
              <Input type="number" placeholder="जैसे: 5" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} className="h-11 bg-slate-50 border-slate-200 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">गाँव / जिला *</label>
              <VoiceInput value={farmLocation} onChange={setFarmLocation} placeholder="बोलें या टाइप करें..." theme="green" size="md" variant="inline" />
            </div>

            {/* Optional detail fields */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">अतिरिक्त जानकारी (वैकल्पिक)</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">भूमि का प्रकार</label>
                  <Select value={farmLandType} onValueChange={setFarmLandType}>
                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl text-sm">
                      <SelectValue placeholder="चुनें..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {LAND_TYPES.map(l => <SelectItem key={l.value} value={l.value} className="text-sm">{l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">सिंचाई का स्रोत</label>
                  <Select value={farmIrrigationSource} onValueChange={setFarmIrrigationSource}>
                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl text-sm">
                      <SelectValue placeholder="चुनें..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {IRRIGATION_SOURCES.map(i => <SelectItem key={i.value} value={i.value} className="text-sm">{i.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">मिट्टी का प्रकार</label>
                  <Select value={farmSoilType} onValueChange={setFarmSoilType}>
                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl text-sm">
                      <SelectValue placeholder="चुनें..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {SOIL_TYPES.map(s => <SelectItem key={s.value} value={s.value} className="text-sm">{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {farmError && (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 text-sm">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" /> {farmError}
              </div>
            )}
            <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all" onClick={handleAddFarm} isLoading={isAddingFarm}>
              <Save size={16} className="mr-2" /> सुरक्षित करें
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Farm Modal ──────────────────────────────────────── */}
      <Dialog open={!!editingFarm} onOpenChange={(open) => !open && setEditingFarm(null)}>
        <DialogContent className="max-w-md mx-auto p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl font-black text-white m-0">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
                खेत संपादित करें
              </DialogTitle>
            </DialogHeader>
          </div>
          {editingFarm && (
            <div className="p-5 bg-white space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">खेत का नाम</label>
                <Input value={editingFarm.name} onChange={(e) => setEditingFarm({ ...editingFarm, name: e.target.value })} className="h-11 bg-slate-50 border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">क्षेत्रफल ({unitLabel})</label>
                <Input
                  type="number"
                  value={convertFromAcre(editingFarm.sizeAcre, unitPref)}
                  onChange={(e) => setEditingFarm({ ...editingFarm, sizeAcre: parseFloat(e.target.value) || 0 })}
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">गाँव / जिला</label>
                <Input value={editingFarm.location} onChange={(e) => setEditingFarm({ ...editingFarm, location: e.target.value })} className="h-11 bg-slate-50 border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">भूमि का प्रकार</label>
                <Select value={editingFarm.landType || ""} onValueChange={(v) => setEditingFarm({ ...editingFarm, landType: v })}>
                  <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl text-sm"><SelectValue placeholder="चुनें..." /></SelectTrigger>
                  <SelectContent className="rounded-xl">{LAND_TYPES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">सिंचाई का स्रोत</label>
                <Select value={editingFarm.irrigationSource || ""} onValueChange={(v) => setEditingFarm({ ...editingFarm, irrigationSource: v })}>
                  <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl text-sm"><SelectValue placeholder="चुनें..." /></SelectTrigger>
                  <SelectContent className="rounded-xl">{IRRIGATION_SOURCES.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">मिट्टी का प्रकार</label>
                <Select value={editingFarm.soilType || ""} onValueChange={(v) => setEditingFarm({ ...editingFarm, soilType: v })}>
                  <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl text-sm"><SelectValue placeholder="चुनें..." /></SelectTrigger>
                  <SelectContent className="rounded-xl">{SOIL_TYPES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md active:scale-[0.98] transition-all" onClick={handleEditFarm}>
                <Save size={16} className="mr-2" /> अपडेट करें
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Add Season Modal ──────────────────────────────────────── */}
      <Dialog open={!!showAddSeasonModal} onOpenChange={(open) => !open && setShowAddSeasonModal(null)}>
        <DialogContent className="max-w-md mx-auto p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <DialogHeader className="relative z-10">
              <DialogTitle className="flex items-center gap-3 text-xl font-black text-white m-0">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                फसल शुरू करें
              </DialogTitle>
            </DialogHeader>
            <p className="text-amber-50 text-sm mt-1.5 opacity-90 relative z-10">
              <strong>{showAddSeasonModal?.farmName}</strong> में नई फसल
            </p>
          </div>
          <div className="p-5 bg-white space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">फसल का नाम *</label>
              <VoiceInput value={cropName} onChange={setCropName} placeholder="फसल का नाम बोलें या लिखें..." theme="orange" size="md" variant="inline" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">बुवाई की तारीख *</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 bg-slate-50 border-slate-200 rounded-xl" />
            </div>
            {seasonError && (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 text-sm">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" /> {seasonError}
              </div>
            )}
            <Button className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all" onClick={handleAddSeason} isLoading={isAddingSeason}>
              <Play size={16} className="mr-2" fill="currentColor" /> फसल शुरू करें
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Delete ──────────────────────────────────────── */}
      <Dialog open={!!confirmDeleteFarm} onOpenChange={(open) => !open && setConfirmDeleteFarm(null)}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl border-0 shadow-xl">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-black text-lg text-slate-800 mb-2">खेत हटाएं?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              <strong>{confirmDeleteFarm?.name}</strong> और उससे जुड़ा सारा डेटा (फसलें, खर्चे, आमदनी) हमेशा के लिए मिट जाएगा।
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setConfirmDeleteFarm(null)}>रद्द करें</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl" onClick={handleDeleteFarm}>हाँ, हटाएं</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Complete Season ──────────────────────────────── */}
      <Dialog open={!!confirmCompleteSeason} onOpenChange={(open) => !open && setConfirmCompleteSeason(null)}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl border-0 shadow-xl">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
              <CheckCircle2 className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="font-black text-lg text-slate-800 mb-2">फसल पूरी करें?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              <strong>{confirmCompleteSeason?.cropName}</strong> की फसल को पूर्ण मार्क करेंगे। बाद में नई फसल शुरू कर सकते हैं।
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setConfirmCompleteSeason(null)}>रद्द करें</Button>
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl" onClick={handleCompleteSeason}>हाँ, पूरी करें</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Kisan Score Widget ─────────────────────────────────────────────────────
function KisanScoreWidget() {
  const { apiCall, activeFarm } = useApp();
  const router = useRouter();
  const [score, setScore] = useState<number | null>(null);
  const [label, setLabel] = useState("—");

  useEffect(() => {
    apiCall<{ success: boolean; data: any }>(
      activeFarm?.id ? `/api/user/insights?farmId=${activeFarm.id}` : "/api/user/insights"
    )
      .then((r) => {
        if (r.success) {
          setScore(r.data.trustScore);
          setLabel(r.data.trustScoreLabel);
        }
      })
      .catch(() => { });
  }, [activeFarm?.id, apiCall]);

  const pct = score ? (score / 850) * 100 : 0;
  const scoreColor = score && score > 750 ? "text-emerald-600" : score && score > 650 ? "text-blue-600" : "text-amber-600";
  const barColor = score && score > 750 ? "bg-emerald-500" : score && score > 650 ? "bg-blue-500" : "bg-amber-500";

  return (
    <Card
      className="p-4 border-0 shadow-sm bg-white rounded-2xl cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
      onClick={() => router.push("/app/credit")}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center flex-shrink-0 shadow-inner">
          <ShieldCheck className="w-7 h-7 text-emerald-400" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-bold text-slate-800">किसान ट्रस्ट स्कोर</p>
            <div className="flex items-center gap-1.5">
              <span className={`text-xl font-black ${scoreColor}`}>{score ?? "—"}</span>
              <span className="text-xs text-slate-400 font-medium">/850</span>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-slate-500 font-medium">{label}</span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              विस्तार देखें <ChevronRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${enabled ? "bg-emerald-500" : "bg-slate-200"}`}
    >
      <span className={`inline-block w-4 h-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

// ─── Notifications Section ─────────────────────────────────────────────────────
function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotifPrefs>(() => {
    if (typeof window === "undefined") return NOTIF_DEFAULTS;
    try {
      const saved = localStorage.getItem("kisan_notif_prefs");
      return saved ? { ...NOTIF_DEFAULTS, ...JSON.parse(saved) } : NOTIF_DEFAULTS;
    } catch { return NOTIF_DEFAULTS; }
  });

  const toggle = (key: keyof NotifPrefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("kisan_notif_prefs", JSON.stringify(next));
      return next;
    });
  };

  const NOTIF_ITEMS = [
    {
      key: "mandi" as keyof NotifPrefs,
      icon: BarChart3,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "मंडी भाव अलर्ट",
      desc: "फसल की कीमत में बड़ा बदलाव होने पर सूचना",
    },
    {
      key: "weather" as keyof NotifPrefs,
      icon: Droplets,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-600",
      title: "मौसम चेतावनी",
      desc: "बारिश या गर्मी की चेतावनी मिलने पर अलर्ट",
    },
    {
      key: "borrowing" as keyof NotifPrefs,
      icon: HandCoins,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      title: "उधार याद दिलाना",
      desc: "उधार की तारीख से 3 दिन पहले रिमाइंडर",
    },
    {
      key: "daily" as keyof NotifPrefs,
      icon: Wheat,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      title: "दैनिक काम रिमाइंडर",
      desc: "शाम 6 बजे: 'आज का काम लिखा?' रिमाइंडर",
    },
    {
      key: "stock" as keyof NotifPrefs,
      icon: Package,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      title: "भंडार कम होने का अलर्ट",
      desc: "बीज, खाद या दवाई का स्टॉक कम होने पर",
    },
  ];

  return (
    <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
      <div className="divide-y divide-slate-100">
        {NOTIF_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="flex items-center gap-4 p-4">
              <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={item.iconColor} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
              <Toggle enabled={prefs[item.key]} onToggle={() => toggle(item.key)} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Language & Units Section ──────────────────────────────────────────────────
function LanguageUnitsSection() {
  const { language, setLanguage } = useApp();

  const [unitPref, setUnitPrefState] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("kisan_unit_pref") || "acre";
    return "acre";
  });

  const handleUnitChange = (val: string) => {
    setUnitPrefState(val);
    localStorage.setItem("kisan_unit_pref", val);
  };

  return (
    <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
      <div className="divide-y divide-slate-100">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Globe size={20} className="text-blue-600" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">भाषा / Language</p>
              <p className="text-xs text-slate-500">ऐप की भाषा बदलें</p>
            </div>
          </div>
          <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
            <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl font-medium text-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-lg">
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code} className="font-medium focus:bg-emerald-50 focus:text-emerald-700 rounded-lg">
                  {l.name} <span className="text-slate-400 text-xs">({l.englishName})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Wheat size={20} className="text-amber-600" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">ज़मीन की इकाई / Land Unit</p>
              <p className="text-xs text-slate-500">एकड़, बीघा या हेक्टेयर चुनें</p>
            </div>
          </div>
          <Select value={unitPref} onValueChange={handleUnitChange}>
            <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl font-medium text-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-lg">
              {UNIT_OPTIONS.map((u) => (
                <SelectItem key={u.value} value={u.value} className="font-medium focus:bg-emerald-50 focus:text-emerald-700 rounded-lg">
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-slate-400 mt-2 ml-1">
            सभी खेतों का आकार चुनी हुई इकाई में दिखेगा।
          </p>
        </div>
      </div>
    </Card>
  );
}

// ─── Security Section ─────────────────────────────────────────────────────────
function SecuritySection() {
  const { apiCall } = useApp();
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState(false);

  const handleChangePin = async () => {
    if (newPin !== confirmPin) { setPinError("नया PIN दोनों में एक जैसा होना चाहिए।"); return; }
    if (newPin.length < 4) { setPinError("PIN कम से कम 4 अंकों का होना चाहिए।"); return; }
    setIsChanging(true);
    setPinError("");
    try {
      await apiCall("/api/auth/change-pin", {
        method: "PUT",
        body: JSON.stringify({ currentPin, newPin }),
      });
      setPinSuccess(true);
      setTimeout(() => {
        setShowChangePinModal(false);
        setPinSuccess(false);
        setCurrentPin(""); setNewPin(""); setConfirmPin("");
      }, 1500);
    } catch (e: any) {
      setPinError(e?.message || "PIN बदलने में विफल।");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="divide-y divide-slate-100">
          <button
            onClick={() => setShowChangePinModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                <KeyRound size={20} className="text-purple-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">PIN बदलें</p>
                <p className="text-xs text-slate-500">अपना लॉगिन PIN अपडेट करें</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
          </button>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Lock size={20} className="text-emerald-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">डेटा सुरक्षा</p>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck size={11} /> एन्क्रिप्टेड और सुरक्षित
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-lg border border-emerald-100">SECURE</span>
          </div>
        </div>
      </Card>

      {/* Change PIN Modal */}
      <Dialog open={showChangePinModal} onOpenChange={(open) => { if (!open) { setShowChangePinModal(false); setPinError(""); } }}>
        <DialogContent className="max-w-md mx-auto p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl font-black text-white m-0">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
                  <KeyRound className="w-6 h-6 text-white" />
                </div>
                PIN बदलें
              </DialogTitle>
            </DialogHeader>
            <p className="text-purple-100 text-sm mt-1.5 opacity-90">4–6 अंकों का नया PIN सेट करें</p>
          </div>
          <div className="p-5 bg-white space-y-4">
            {pinSuccess ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="font-bold text-slate-800">PIN सफलतापूर्वक बदल गया!</p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">मौजूदा PIN</label>
                  <div className="relative">
                    <Input
                      type={showCurrent ? "text" : "password"}
                      maxLength={6}
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="मौजूदा PIN डालें"
                      className="h-11 bg-slate-50 border-slate-200 rounded-xl pr-12"
                    />
                    <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">नया PIN</label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="4–6 अंकों का PIN"
                      className="h-11 bg-slate-50 border-slate-200 rounded-xl pr-12"
                    />
                    <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">PIN दोबारा लिखें</label>
                  <Input
                    type="password"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="नया PIN फिर लिखें"
                    className={`h-11 bg-slate-50 border-slate-200 rounded-xl ${confirmPin && newPin !== confirmPin ? "border-red-300" : ""}`}
                  />
                </div>
                {pinError && (
                  <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 text-sm">
                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" /> {pinError}
                  </div>
                )}
                <Button
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md active:scale-[0.98] transition-all"
                  onClick={handleChangePin}
                  isLoading={isChanging}
                >
                  <KeyRound size={16} className="mr-2" /> PIN अपडेट करें
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Help Section ────────────────────────────────────────────────────────────
function HelpSection() {
  const router = useRouter();

  const handleHelpClick = (item: any) => {
    if (item.href) {
      if (item.external) {
        window.open(item.href, "_blank");
      } else {
        router.push(item.href);
      }
    }
  };

  const ITEMS = [
    { icon: HelpCircle, bg: "bg-amber-50", color: "text-amber-600", title: "सहायता और सपोर्ट", desc: "WhatsApp पर मदद लें", href: "https://wa.me/918077170715?text=मुझे+किसान+डायरी+ऐप+के+बारे+में+सहायता+चाहिए", external: true },
    { icon: Shield, bg: "bg-emerald-50", color: "text-emerald-600", title: "प्राइवेसी पॉलिसी", desc: "आपके डेटा की सुरक्षा के बारे में", href: "/app/privacy", external: false },
    { icon: FileText, bg: "bg-blue-50", color: "text-blue-600", title: "उपयोग की शर्तें", desc: "Terms & Conditions", href: "/app/terms", external: false },
    { icon: Info, bg: "bg-slate-50", color: "text-slate-600", title: "किसान स्कोर के बारे में", desc: "स्कोर कैसे काम करता है?", href: "/app/credit", external: false },
  ];

  return (
    <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
      <div className="divide-y divide-slate-100">
        {ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <button key={i} onClick={() => handleHelpClick(item)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon size={20} className={item.color} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, language, logout } = useApp();
  const router = useRouter();
  const lang = language;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
          <Settings className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">लॉगिन आवश्यक है</h2>
        <p className="text-slate-500 text-center mb-8 max-w-xs">सेटिंग्स देखने के लिए लॉगिन करें।</p>
        <Button className="h-12 px-8 rounded-xl bg-emerald-600 text-white font-bold" onClick={() => router.push("/login")}>
          🔑 {t(lang, "login")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] pb-28">

      {/* Premium Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 px-5 pt-14 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-inner">
            <Settings className="w-5 h-5 text-emerald-300" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-white text-2xl font-black tracking-tight">{t(lang, "settings")}</h1>
            <p className="text-emerald-200/70 text-sm font-medium">खाता और प्राथमिकताएं</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-16 relative z-20 space-y-7">

        {/* 1. Profile */}
        <ProfileSection />

        {/* 2. Kisan Score Widget */}
        <div>
          <SectionLabel>किसान स्कोर (Kisan Score)</SectionLabel>
          <KisanScoreWidget />
        </div>

        {/* 3. My Farms */}
        <div>
          <SectionLabel>मेरे खेत (My Farms)</SectionLabel>
          <FarmsManager />
        </div>

        {/* 4. Notifications */}
        <div>
          <SectionLabel>सूचनाएं (Notifications)</SectionLabel>
          <NotificationsSection />
        </div>

        {/* 5. Language & Units */}
        <div>
          <SectionLabel>भाषा और इकाई (Language & Units)</SectionLabel>
          <LanguageUnitsSection />
        </div>

        {/* 6. Security */}
        <div>
          <SectionLabel>खाता सुरक्षा (Security)</SectionLabel>
          <SecuritySection />
        </div>

        {/* 7. Help & Info */}
        <div>
          <SectionLabel>सहायता (Help & Info)</SectionLabel>
          <HelpSection />
        </div>

        {/* 8. Logout */}
        <div className="pt-2 pb-4">
          <Button
            variant="outline"
            className="w-full h-14 bg-white border-red-100 hover:bg-red-50 hover:border-red-200 text-red-600 hover:text-red-700 font-bold rounded-2xl shadow-sm text-base gap-2 transition-all active:scale-[0.98]"
            onClick={handleLogout}
          >
            <LogOut size={18} strokeWidth={2.5} /> लॉगआउट (Logout)
          </Button>
          <div className="flex flex-col items-center mt-7 space-y-1">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Kisan Diary</p>
            <p className="text-[10px] font-medium text-slate-400">संस्करण 1.0.0 · Enterprise Edition</p>
          </div>
        </div>

      </div>
    </div>
  );
}
