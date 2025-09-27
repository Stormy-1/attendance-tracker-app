// utils/calculateAttendanceStats.js

import {
    differenceInDays,
    eachDayOfInterval,
    isWeekend,
    parseISO,
  } from "date-fns";
  
  /**
   * Calculate attendance stats (overall + per subject).
   *
   * @param {Object} setup - Semester setup
   *   { startDate, endDate, weeklyOffDays, requiredPercentage, holidays }
   * @param {Object} attendanceLogs - Map { dateString: { subjectCode: boolean } }
   * @param {Array} timetable - Array of { day, time, subject }
   * @returns {Object} { overallStats, perSubjectStats }
   */
  export default function calculateAttendanceStats(setup, attendanceLogs, timetable) {
    if (!setup || !setup.startDate || !setup.endDate) {
      return {
        overallStats: {
          percentage: 0,
          attended: 0,
          total: 0,
          needed: 0,
          bunkable: 0,
        },
        perSubjectStats: {},
      };
    }
  
    const start = parseISO(setup.startDate);
    const end = parseISO(setup.endDate);
  
    const weeklyOffDays = setup.weeklyOffDays || []; // e.g. [0=Sun, 6=Sat]
    const holidays = (setup.holidays || []).map((d) => parseISO(d));
    const required = setup.requiredPercentage || 75;
  
    // Build calendar of teaching days
    const days = eachDayOfInterval({ start, end });
    const teachingDays = days.filter((d) => {
      const dow = d.getDay();
      const isWeeklyOff = weeklyOffDays.includes(dow);
      const isHoliday = holidays.some(
        (h) => h.toDateString() === d.toDateString()
      );
      return !isWeeklyOff && !isHoliday;
    });
  
    // Map subject -> total/attended
    const perSubjectStats = {};
    timetable.forEach((slot) => {
      if (!perSubjectStats[slot.subject]) {
        perSubjectStats[slot.subject] = {
          total: 0,
          attended: 0,
        };
      }
    });
  
    // Count classes
    teachingDays.forEach((d) => {
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      const dateStr = d.toISOString().split("T")[0];
      const todaysSlots = timetable.filter((s) => s.day === dayName);
  
      todaysSlots.forEach((slot) => {
        const subj = slot.subject;
        perSubjectStats[subj].total += 1;
  
        if (attendanceLogs?.[dateStr]?.[subj]) {
          perSubjectStats[subj].attended += 1;
        }
      });
    });
  
    // Compute percentages per subject
    Object.keys(perSubjectStats).forEach((subj) => {
      const { total, attended } = perSubjectStats[subj];
      const percentage = total > 0 ? (attended / total) * 100 : 0;
  
      // Classes needed to reach required %
      const needed =
        total > 0
          ? Math.max(0, Math.ceil((required * total - 100 * attended) / (100 - required)))
          : 0;
  
      // Classes you can bunk and still stay ≥ required %
      const bunkable =
        total > 0
          ? Math.max(
              0,
              Math.floor((100 * attended - required * total) / required)
            )
          : 0;
  
      perSubjectStats[subj] = {
        ...perSubjectStats[subj],
        percentage,
        needed,
        bunkable,
      };
    });
  
    // Overall stats
    const overallAttended = Object.values(perSubjectStats).reduce(
      (sum, s) => sum + s.attended,
      0
    );
    const overallTotal = Object.values(perSubjectStats).reduce(
      (sum, s) => sum + s.total,
      0
    );
    const overallPercentage =
      overallTotal > 0 ? (overallAttended / overallTotal) * 100 : 0;
  
    const overallNeeded =
      overallTotal > 0
        ? Math.max(
            0,
            Math.ceil(
              (required * overallTotal - 100 * overallAttended) / (100 - required)
            )
          )
        : 0;
  
    const overallBunkable =
      overallTotal > 0
        ? Math.max(
            0,
            Math.floor(
              (100 * overallAttended - required * overallTotal) / required
            )
          )
        : 0;
  
    return {
      overallStats: {
        percentage: overallPercentage,
        attended: overallAttended,
        total: overallTotal,
        needed: overallNeeded,
        bunkable: overallBunkable,
      },
      perSubjectStats,
    };
  }
  