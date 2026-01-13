"use client";

import * as React from "react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DATA = {
  utis_id: 1973856,
  pupils: [
    3496550, 3284314, 3513402, 3505387, 3505010, 3258489, 3277613, 3265364,
    3506088, 3259706, 3505155, 3265001, 3407212, 3347879, 3622141, 3485969,
    3505743, 3505698, 3505807, 3658979, 3569691, 3600720, 3259608, 3272708,
    3307329, 3323171, 3407599, 3505951, 3516811, 3149985,
  ],
  subjects: [
    {
      is_group: false,
      name: "Azərbaycan dili",
      teacher: { utis_id: 4111205, name: "AYTAC TEYMURZADƏ" },
    },
    {
      is_group: false,
      name: "Ədəbiyyat",
      teacher: { utis_id: 4111205, name: "AYTAC TEYMURZADƏ" },
    },
    {
      is_group: false,
      name: "Riyaziyyat",
      teacher: { utis_id: 2913943, name: "SƏMA MƏMMƏDOVA" },
    },
    {
      is_group: false,
      name: "Azərbaycan tarixi",
      teacher: { utis_id: 4274220, name: "TƏBRİZ ƏŞRƏFLİ" },
    },
    {
      is_group: false,
      name: "Ümumi tarix",
      teacher: { utis_id: 4274220, name: "TƏBRİZ ƏŞRƏFLİ" },
    },
    {
      is_group: false,
      name: "Fizika",
      teacher: { utis_id: 3245652, name: "İNARƏ QULİYEVA" },
    },
    {
      is_group: false,
      name: "Kimya",
      teacher: { utis_id: 1242540, name: "CƏMİLƏ ÇƏLƏBİYEVA" },
    },
    {
      is_group: false,
      name: "Biologiya",
      teacher: { utis_id: 3208131, name: "AZƏR NƏBİYEV" },
    },
    {
      is_group: false,
      name: "Coğrafiya",
      teacher: { utis_id: 4430301, name: "İNARƏ ALYAZOVA" },
    },
    {
      is_group: false,
      name: "Texnologiya",
      teacher: { utis_id: 1244909, name: "NAZİMƏT MİSİRXANOVA" },
    },
    {
      is_group: false,
      name: "Musiqi",
      teacher: { utis_id: 3208113, name: "KÖNÜL HƏSƏNOVA" },
    },
    {
      is_group: false,
      name: "Təsviri incəsənət",
      teacher: { utis_id: 3475140, name: "NAZİLƏ OVÇUYEVA" },
    },
    {
      is_group: true,
      name: "İngilis dili",
      teacher: { utis_id: 4268490, name: "TÜRKAN SADİQOVA" },
      pupils: [
        3259608, 3265364, 3272708, 3307329, 3323171, 3505010, 3505155, 3505387,
        3505698, 3505743, 3505807, 3505951, 3569691, 3622141, 3661898,
      ],
    },
    {
      is_group: true,
      name: "İngilis dili",
      teacher: { utis_id: 2644052, name: "GÜLƏR MƏMMƏDOVA" },
      pupils: [
        3149985, 3258489, 3259706, 3265001, 3277613, 3284314, 3347879, 3407212,
        3485969, 3496550, 3506088, 3513402, 3516811, 3600720, 3658979,
      ],
    },
    {
      is_group: true,
      name: "Rus dili",
      teacher: { utis_id: 2862584, name: "ZÜLFİYYƏ ZƏRBƏLİYEVA" },
      pupils: [
        3149985, 3258489, 3259706, 3265001, 3277613, 3284314, 3347879, 3407212,
        3485969, 3496550, 3506088, 3513402, 3516811, 3600720, 3658979,
      ],
    },
    {
      is_group: true,
      name: "Rus dili",
      teacher: { utis_id: 1196886, name: "GÜLNARƏ ƏFƏNDİYEVA" },
      pupils: [
        3259608, 3265364, 3272708, 3307329, 3323171, 3505010, 3505155, 3505387,
        3505698, 3505743, 3505807, 3505951, 3569691, 3622141, 3661898,
      ],
    },
    {
      is_group: true,
      name: "Fiziki tərbiyə",
      teacher: { utis_id: 1188229, name: "XATİRƏ MƏMMƏDOVA" },
      pupils: [
        3149985, 3258489, 3259706, 3265001, 3277613, 3284314, 3347879, 3407212,
        3485969, 3496550, 3506088, 3513402, 3516811, 3600720, 3658979,
      ],
    },
    {
      is_group: true,
      name: "Fiziki tərbiyə",
      teacher: { utis_id: 4430609, name: "ORXAN NAMAZOV" },
      pupils: [
        3259608, 3265364, 3272708, 3307329, 3323171, 3505010, 3505155, 3505387,
        3505698, 3505743, 3505807, 3505951, 3569691, 3622141, 3661898,
      ],
    },
    {
      is_group: true,
      name: "Rəqəmsal bacarıqlar",
      teacher: { utis_id: 3396113, name: "GÜNAY ŞAHVERDİYEVA" },
      pupils: [
        3149985, 3258489, 3259706, 3265001, 3277613, 3284314, 3347879, 3407212,
        3485969, 3496550, 3506088, 3513402, 3516811, 3600720, 3658979,
      ],
    },
    {
      is_group: true,
      name: "Rəqəmsal bacarıqlar",
      teacher: { utis_id: 3842774, name: "XƏDİCƏ HİDAYƏTOVA" },
      pupils: [
        3259608, 3265364, 3272708, 3307329, 3323171, 3505010, 3505155, 3505387,
        3505698, 3505743, 3505807, 3505951, 3569691, 3622141, 3661898,
      ],
    },
    {
      is_group: true,
      name: "STEAM",
      teacher: { utis_id: 2913943, name: "SƏMA MƏMMƏDOVA" },
      pupils: [
        3149985, 3258489, 3259706, 3265001, 3277613, 3284314, 3347879, 3407212,
        3485969, 3496550, 3506088, 3513402, 3516811, 3600720, 3658979,
      ],
    },
    {
      is_group: true,
      name: "STEAM",
      teacher: { utis_id: 1163116, name: "SƏBUHİ ŞİRİNOV" },
      pupils: [
        3259608, 3265364, 3272708, 3307329, 3323171, 3505010, 3505155, 3505387,
        3505698, 3505743, 3505807, 3505951, 3569691, 3622141, 3661898,
      ],
    },
  ],
};

export default function DSPage() {
  const [selectedType, setSelectedType] = React.useState<string>("");
  const [selectedUtisId, setSelectedUtisId] = React.useState<string>("");
  const [studentName, setStudentName] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  const uniqueTeachers = React.useMemo(() => {
    const teachersMap = new Map();
    DATA.subjects.forEach((subject) => {
      if (subject.teacher && subject.teacher.utis_id) {
        teachersMap.set(subject.teacher.utis_id, subject.teacher);
      }
    });
    return Array.from(teachersMap.values());
  }, []);

  const currentOptions = React.useMemo(() => {
    if (selectedType === "teacher") {
      return uniqueTeachers.map((t) => ({
        value: t.utis_id.toString(),
        label: t.utis_id.toString(),
      }));
    } else if (selectedType === "student") {
      return DATA.pupils.map((p) => ({
        value: p.toString(),
        label: p.toString(),
      }));
    }
    return [];
  }, [selectedType, uniqueTeachers]);

  const displayedName = React.useMemo(() => {
    if (selectedType === "teacher") {
      if (!selectedUtisId) return "";
      const teacher = uniqueTeachers.find(
        (t) => t.utis_id.toString() === selectedUtisId
      );
      return teacher ? teacher.name : "";
    }
    return studentName;
  }, [selectedType, selectedUtisId, uniqueTeachers, studentName]);

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setSelectedUtisId("");
    setStudentName("");
  };

  const handleSubmit = async () => {
    if (!selectedType || !selectedUtisId) {
      alert("Please select all required fields");
      return;
    }

    setLoading(true);
    try {
      const data =
        selectedType === "teacher"
          ? {
              type: "teacher",
              personal_identity_info: {
                name: displayedName.split(" ")[0] || "",
                middle_name: "",
                surname: displayedName.split(" ")[1] || "",
                patronymic: "RUSTEM OGLU",
                gender: "MALE",
              },
              utis_teacher_info: {
                utis_code: parseInt(selectedUtisId, 10),
                school_utis_codes: [360452736, 432452736],
                lang_name: "Azərbaycan",
                main_subject_name: "Kimya",
                main_subject_id: 20000106,
              },
            }
          : {
              type: "student",
              personal_identity_info: {
                name: studentName.split(" ")[0] || "",
                middle_name: "",
                surname: studentName.split(" ")[1] || "",
                patronymic: "RUSTEM OGLU",
                gender: "MALE",
              },
              utis_student_info: {
                utis_code: parseInt(selectedUtisId, 10),
                school_utis_code: 360452736,
                teach_status: "Oxuyur",
                class_code: 1885845,
              },
            };
      const response = await axios.post("/api/proxy/ds/login", data, {
        headers: {
          "Landau-Token": "gSgCzdAQuvcfd9jDkD4XAdznzhte3AtVR3fh6A6uuPPvZGun7c",
          "Content-Type": "application/json",
        },
      });
      console.log("Response:", response.data);
      if (response.data?.body?.redirect_url) {
        const redirectUrl = response.data.body.redirect_url;
        window.open(redirectUrl, "_blank");
      } else {
        alert("Data sent successfully!");
      }
    } catch (error) {
      console.error("Error sending data:", error);
      alert("Failed to send data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Data Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type-select">Type</Label>
            <Select onValueChange={handleTypeChange} value={selectedType}>
              <SelectTrigger id="type-select">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(selectedType === "teacher" || selectedType === "student") && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="space-y-2">
                <Label htmlFor="utis-id-select">
                  {selectedType === "teacher"
                    ? "Teacher UTIS ID"
                    : "Student UTIS ID"}
                </Label>
                <Select
                  onValueChange={setSelectedUtisId}
                  value={selectedUtisId}
                >
                  <SelectTrigger id="utis-id-select">
                    <SelectValue placeholder="Pick UTIS ID" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name-input">Name</Label>
                <Input
                  id="name-input"
                  value={displayedName}
                  onChange={(e) => {
                    if (selectedType === "student") {
                      setStudentName(e.target.value);
                    }
                  }}
                  readOnly={selectedType === "teacher"}
                  placeholder={
                    selectedType === "teacher"
                      ? "Teacher name will appear here"
                      : "Enter student name"
                  }
                  className={selectedType === "teacher" ? "bg-muted" : ""}
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Go to Aspire Learning"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
