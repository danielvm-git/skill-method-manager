use serde::{Serialize, Deserialize};
use std::fs;
use std::path::PathBuf;
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use walkdir::WalkDir;
use tauri::{AppHandle, Manager, Emitter};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Skill {
    id: String,
    name: String,
    description: String,
    version: String,
    author: String,
    status: String,
    #[serde(rename = "type")]
    skill_type: String,
    pub dependencies: Option<Vec<String>>,
}

#[derive(Deserialize)]
struct SkillManifest {
    skill: SkillData,
}

#[derive(Deserialize)]
struct SkillData {
    id: String,
    name: String,
    description: String,
    version: String,
    author: String,
    dependencies: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AppConfig {
    pub skills_dir: Option<String>,
    pub auto_reload: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            skills_dir: None,
            auto_reload: true,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ActivityEntry {
    id: String,
    skill_id: String,
    skill_name: String,
    action: String, // "install", "update", "uninstall", "enable", "disable", "error"
    timestamp: u64,
    status: String, // "success", "failure"
    message: Option<String>,
}

#[derive(Serialize, Clone)]
struct InstallProgress {
    id: String,
    status: String,
    progress: f32,
    message: String,
}

fn get_config_path(app_handle: &AppHandle) -> PathBuf {
    app_handle.path().app_config_dir().unwrap().join("config.json")
}

fn get_activity_path(app_handle: &AppHandle) -> PathBuf {
    app_handle.path().app_config_dir().unwrap().join("activity.json")
}

#[tauri::command]
fn get_config(app_handle: AppHandle) -> AppConfig {
    let config_path = get_config_path(&app_handle);
    if let Ok(content) = fs::read_to_string(config_path) {
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        AppConfig::default()
    }
}

#[tauri::command]
fn update_config(app_handle: AppHandle, config: AppConfig) -> Result<(), String> {
    let config_path = get_config_path(&app_handle);
    let config_dir = config_path.parent().unwrap();
    
    fs::create_dir_all(config_dir).map_err(|e| e.to_string())?;
    let content = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(config_path, content).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn log_activity(app_handle: AppHandle, entry: ActivityEntry) -> Result<(), String> {
    let activity_path = get_activity_path(&app_handle);
    let config_dir = activity_path.parent().unwrap();
    fs::create_dir_all(config_dir).map_err(|e| e.to_string())?;

    let mut activities: Vec<ActivityEntry> = if activity_path.exists() {
        let content = fs::read_to_string(&activity_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        Vec::new()
    };

    activities.insert(0, entry);
    
    // Rotate at 500 entries
    if activities.len() > 500 {
        activities.truncate(500);
    }

    let content = serde_json::to_string_pretty(&activities).map_err(|e| e.to_string())?;
    fs::write(activity_path, content).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn get_activities(app_handle: AppHandle) -> Vec<ActivityEntry> {
    let activity_path = get_activity_path(&app_handle);
    if let Ok(content) = fs::read_to_string(activity_path) {
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        Vec::new()
    }
}

#[tauri::command]
fn get_skills(app_handle: AppHandle) -> Vec<Skill> {
    let mut skills = Vec::new();
    let config = get_config(app_handle.clone());
    let skills_dir = if let Some(path_str) = config.skills_dir {
        PathBuf::from(path_str)
    } else {
        app_handle.path().app_data_dir().unwrap_or_else(|_| {
            PathBuf::from("skills")
        }).join("skills")
    };
    
    if !skills_dir.exists() {
        let _ = fs::create_dir_all(&skills_dir);
        return vec![];
    }

    for entry in WalkDir::new(skills_dir).max_depth(2).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_file() && path.file_name().map_or(false, |n| n == "skill.toml") {
            if let Ok(content) = fs::read_to_string(path) {
                if let Ok(manifest) = toml::from_str::<SkillManifest>(&content) {
                    skills.push(Skill {
                        id: manifest.skill.id.clone(),
                        name: manifest.skill.name,
                        description: manifest.skill.description,
                        version: manifest.skill.version,
                        author: manifest.skill.author,
                        status: "active".into(),
                        skill_type: if manifest.skill.id.contains("method") { "method".into() } else { "skill".into() },
                        dependencies: manifest.skill.dependencies,
                    });
                }
            }
        }
    }
    skills
}

#[tauri::command]
fn resolve_dependencies(skill_id: String) -> Result<Vec<String>, String> {
    if skill_id == "reg-skill-1" {
        Ok(vec!["python-runtime-3.11".into(), "pandas-toolkit".into()])
    } else if skill_id == "reg-skill-2" {
        Ok(vec!["node-js-20".into()])
    } else {
        Ok(vec![])
    }
}

#[tauri::command]
fn install_skill(app_handle: AppHandle, skill_id: String, skill_name: String) -> Result<(), String> {
    let skill_id_clone = skill_id.clone();
    let skill_name_clone = skill_name.clone();
    let handle = app_handle.clone();
    
    thread::spawn(move || {
        let statuses = ["downloading", "extracting", "validating", "finalizing"];
        
        for (i, status) in statuses.iter().enumerate() {
            let progress = (i + 1) as f32 / statuses.len() as f32;
            let _ = handle.emit("install-progress", InstallProgress {
                id: skill_id_clone.clone(),
                status: status.to_string(),
                progress,
                message: format!("Processing {}...", status),
            });
            thread::sleep(Duration::from_millis(1000));
        }
        
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
        let _ = log_activity(handle.clone(), ActivityEntry {
            id: format!("act-{}", now),
            skill_id: skill_id_clone.clone(),
            skill_name: skill_name_clone,
            action: "install".into(),
            timestamp: now,
            status: "success".into(),
            message: None,
        });
        
        let _ = handle.emit("install-success", skill_id_clone);
    });
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![
        get_skills, 
        get_config, 
        update_config, 
        resolve_dependencies, 
        install_skill,
        get_activities,
        log_activity
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
