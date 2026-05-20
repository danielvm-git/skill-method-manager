use serde::{Serialize, Deserialize};
use std::fs;
use std::path::PathBuf;
use walkdir::WalkDir;
use tauri::{AppHandle, Manager};

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

fn get_config_path(app_handle: &AppHandle) -> PathBuf {
    app_handle.path().app_config_dir().unwrap().join("config.json")
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
fn get_skills(app_handle: AppHandle) -> Vec<Skill> {
    let mut skills = Vec::new();
    
    // Get the configured or default skills directory
    let config = get_config(app_handle.clone());
    let skills_dir = if let Some(path_str) = config.skills_dir {
        PathBuf::from(path_str)
    } else {
        app_handle.path().app_data_dir().unwrap_or_else(|_| {
            PathBuf::from("skills")
        }).join("skills")
    };
    
    // Ensure the directory exists
    if !skills_dir.exists() {
        let _ = fs::create_dir_all(&skills_dir);
        return vec![];
    }

    for entry in WalkDir::new(skills_dir)
        .max_depth(2)
        .into_iter()
        .filter_map(|e| e.ok()) {
        
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
                    });
                }
            }
        }
    }
    
    skills
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![get_skills, get_config, update_config])
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
