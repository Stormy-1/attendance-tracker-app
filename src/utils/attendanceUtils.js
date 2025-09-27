import {
  parseISO,
  isBefore,
  isAfter,
  isSameDay,
  eachDayOfInterval,
  format,
  startOfDay
} from "date-fns";

export default function calculateAttendanceStats(setupData, attendanceLogs) {
  console.log('=== ATTENDANCE CALCULATION DEBUG ===');
  console.log('Setup Data:', setupData);
  console.log('Attendance Logs:', attendanceLogs);

  // Handle missing data
  if (
    !setupData ||
    !setupData.schedules ||
    !Array.isArray(setupData.schedules) ||
    !setupData.semesterData ||
    !setupData.semesterData.startDate ||
    !setupData.semesterData.endDate
  ) {
    console.log('Missing required data');
    return { perSubjectStats: [], overallStats: {} };
  }

  const { schedules, semesterData } = setupData;
  const { 
    startDate, 
    endDate, 
    holidays = [], 
    weeklyOffDays = [],
    requiredAttendance = 75
  } = semesterData;

  console.log('Semester dates:', { startDate, endDate });
  console.log('Weekly off days:', weeklyOffDays);
  console.log('Holidays:', holidays);
  console.log('Required attendance:', requiredAttendance);

  // Parse dates
  const semesterStart = parseISO(startDate);
  const semesterEnd = parseISO(endDate);
  const today = startOfDay(new Date());

  console.log('Parsed dates:', {
    semesterStart: format(semesterStart, 'yyyy-MM-dd'),
    semesterEnd: format(semesterEnd, 'yyyy-MM-dd'),
    today: format(today, 'yyyy-MM-dd')
  });

  // Get unique subjects
  const subjects = [...new Set(schedules.map(s => s.subject))];
  console.log('Unique subjects:', subjects);

  // Create holiday set for fast lookup
  const holidaySet = new Set(holidays);
  console.log('Holiday set:', Array.from(holidaySet));

  // Helper to check if date is weekly off
  const isWeeklyOff = (date) => {
    const dayName = format(date, 'EEEE'); // Full name like "Friday"
    return weeklyOffDays.includes(dayName);
  };

  // Generate all semester dates
  const allDates = eachDayOfInterval({ start: semesterStart, end: semesterEnd });
  console.log(`Total semester days: ${allDates.length}`);

  // Calculate stats for each subject
  const perSubjectStats = subjects.map(subject => {
    console.log(`\n--- Processing subject: ${subject} ---`);
    
    // Find schedules for this subject
    const subjectSchedules = schedules.filter(s => s.subject === subject);
    const scheduledDays = subjectSchedules.map(s => s.day);
    console.log(`Scheduled on: ${scheduledDays.join(', ')}`);

    // Find all valid class dates for this subject
    const classDates = allDates.filter(date => {
      const dayName = format(date, 'EEEE');
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const isDayScheduled = scheduledDays.includes(dayName);
      const isHoliday = holidaySet.has(dateStr);
      const isWeekOff = isWeeklyOff(date);
      
      const isValidClass = isDayScheduled && !isHoliday && !isWeekOff;
      
      if (isDayScheduled) {
        console.log(`  ${dateStr} (${dayName}): holiday=${isHoliday}, weekoff=${isWeekOff}, valid=${isValidClass}`);
      }
      
      return isValidClass;
    });

    const totalClassesInSemester = classDates.length;
    console.log(`Total classes in semester: ${totalClassesInSemester}`);

    // Count classes held so far (up to today, inclusive)
    const classesHeldSoFar = classDates.filter(date => {
      const isBeforeOrToday = isBefore(date, today) || isSameDay(date, today);
      if (isBeforeOrToday) {
        console.log(`  Class held: ${format(date, 'yyyy-MM-dd')}`);
      }
      return isBeforeOrToday;
    }).length;

    console.log(`Classes held so far: ${classesHeldSoFar}`);

    // Count attended classes from logs
    const subjectLogs = (attendanceLogs || []).filter(log => log.subject === subject);
    const classesAttended = subjectLogs.filter(log => log.attended === true).length;
    
    console.log(`Subject logs:`, subjectLogs);
    console.log(`Classes attended: ${classesAttended}`);

    // Calculate current percentage
    let currentPercentage = 0;
    if (classesHeldSoFar > 0) {
      currentPercentage = (classesAttended / classesHeldSoFar) * 100;
    } else {
      currentPercentage = 100; // No classes held yet
    }

    // Calculate remaining classes
    const remainingClasses = totalClassesInSemester - classesHeldSoFar;
    
    // Calculate classes needed to meet requirement
    let classesNeeded = 0;
    if (currentPercentage < requiredAttendance) {
      const totalRequiredClasses = Math.ceil((totalClassesInSemester * requiredAttendance) / 100);
      classesNeeded = Math.max(0, totalRequiredClasses - classesAttended);
      classesNeeded = Math.min(classesNeeded, remainingClasses); // Can't need more than remaining
    }

    // Calculate bunkable classes
    let classesBunkable = 0;
    if (currentPercentage >= requiredAttendance) {
      const totalRequiredClasses = Math.ceil((totalClassesInSemester * requiredAttendance) / 100);
      const maxMissableClasses = totalClassesInSemester - totalRequiredClasses;
      const alreadyMissed = classesHeldSoFar - classesAttended;
      classesBunkable = Math.max(0, maxMissableClasses - alreadyMissed);
      classesBunkable = Math.min(classesBunkable, remainingClasses); // Can't bunk more than remaining
    }

    const result = {
      subject,
      totalClassesInSemester,
      classesHeldSoFar,
      classesAttended,
      currentPercentage: Math.round(currentPercentage * 100) / 100,
      requiredAttendance,
      classesNeeded,
      classesBunkable
    };

    console.log(`${subject} result:`, result);
    return result;
  });

  // Calculate overall stats
  const overallStats = {
    totalClassesInSemester: perSubjectStats.reduce((sum, s) => sum + s.totalClassesInSemester, 0),
    classesHeldSoFar: perSubjectStats.reduce((sum, s) => sum + s.classesHeldSoFar, 0),
    classesAttended: perSubjectStats.reduce((sum, s) => sum + s.classesAttended, 0),
    classesNeeded: perSubjectStats.reduce((sum, s) => sum + s.classesNeeded, 0),
    classesBunkable: perSubjectStats.reduce((sum, s) => sum + s.classesBunkable, 0),
    requiredAttendance
  };

  // Calculate overall percentage
  if (overallStats.classesHeldSoFar > 0) {
    overallStats.currentPercentage = Math.round((overallStats.classesAttended / overallStats.classesHeldSoFar) * 100 * 100) / 100;
  } else {
    overallStats.currentPercentage = 100;
  }

  const finalResult = { perSubjectStats, overallStats };
  console.log('=== FINAL RESULT ===');
  console.log(finalResult);
  
  return finalResult;
}