// src/components/Dashboard.js

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchMaps,
  deleteMap,
  fetchNotifications,
  markNotificationAsRead,
  fetchUserActivity
} from '../api';
import { differenceInDays, formatDistanceToNow } from 'date-fns';
import { UserContext } from '../context/UserContext';

// Icons
import {
  FaStar,
  FaMap,
  FaCalendarAlt,
  FaComment,
  FaReply,
  // FaThumbsUp, // removed since we don't handle "like" in the feed
} from 'react-icons/fa';

// Components
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingSpinner from './LoadingSpinner';

// Map thumbnails
import WorldMapSVG from './WorldMapSVG';
import UsSVG from './UsSVG';
import EuropeSVG from './EuropeSVG';

// CSS
import styles from './Dashboard.module.css';

export default function Dashboard({ isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();
  const { profile } = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(true);
  const [maps, setMaps] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // For deleting a map
  const [mapToDelete, setMapToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ----------------------
  // Basic Stats
  // ----------------------
  const totalMapsCreated = maps.length;
  const totalStarsReceived = maps.reduce(
    (sum, map) => sum + (map.save_count || 0),
    0
  );
  const profileAgeDays = profile?.created_at
    ? differenceInDays(new Date(), new Date(profile.created_at))
    : 0;

  // ----------------------
  // Fetch Data on Mount
  // ----------------------
  useEffect(() => {
    if (!profile) return;

    const getData = async () => {
      try {
        const [mapsRes, notificationsRes] = await Promise.all([
          fetchMaps(),
          fetchNotifications(),
        ]);

        // Sort maps by updated_at desc
        const sortedMaps = mapsRes.data.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
        setMaps(sortedMaps);

        // Sort notifications by created_at desc, limit to 6
        const sortedNotifications = notificationsRes.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 6);

        setNotifications(sortedNotifications);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [profile]);

  // Recently modified maps (up to 10)
  const recentMaps = maps.slice(0, 10);

  // ----------------------
  // Map Deletion Handlers
  // ----------------------
  const handleMapClick = (mapId) => {
    navigate(`/map/${mapId}`);
  };

  const handleEdit = (event, mapId) => {
    event.stopPropagation();
    navigate(`/edit/${mapId}`);
  };

  const handleDelete = (event, mapId) => {
    event.stopPropagation();
    const foundMap = maps.find((m) => m.id === mapId);
    setMapToDelete(foundMap);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!mapToDelete) return;

    try {
      await deleteMap(mapToDelete.id);
      setMaps((prev) => prev.filter((map) => map.id !== mapToDelete.id));
    } catch (err) {
      console.error('Error deleting map:', err);
    } finally {
      setShowDeleteModal(false);
      setMapToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMapToDelete(null);
  };

  // ----------------------
  // Notifications
  // ----------------------
  const handleNotificationClick = async (notif) => {
    try {
      await markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );

      if (notif.map_id) {
        navigate(`/map/${notif.map_id}`);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
  };

  // Handler for entire "Activity Item" click → go to map
  const handleActivityItemClick = (notif) => {
    if (notif.map_id) {
      navigate(`/map/${notif.map_id}`);
    }
  };

  // Handler for user name / avatar click → go to profile
  const handleUserClick = (e, username) => {
    e.stopPropagation(); // Prevent also clicking the map
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  // ----------------------
  // Render Activity Feed (Main Column)
  // ----------------------
  const renderActivityItem = (notif) => {
    const {
      type,
      Map: relatedMap,
      Sender: user,
      Comment: commentObj,
      created_at,
    } = notif || {};

    const senderName = user?.first_name || user?.username || 'Someone';
    const mapTitle = relatedMap?.title || 'Untitled Map';

    // Build user avatar + handle click
    const userAvatarUrl = user?.profile_picture
      ? `http://localhost:5000${user.profile_picture}`
      : '/default-profile-pic.jpg';

    // Create a map thumbnail
    let mapThumbnail = <div className={styles.defaultThumbnail}>Map</div>;
    if (relatedMap?.selected_map === 'world') {
      mapThumbnail = (
        <WorldMapSVG
          groups={relatedMap.groups || []}
          mapTitleValue={mapTitle}
          ocean_color={relatedMap.ocean_color}
          unassigned_color={relatedMap.unassigned_color}
          data={relatedMap.data}
          font_color={relatedMap.font_color}
          is_title_hidden={relatedMap.is_title_hidden}
          isThumbnail
        />
      );
    } else if (relatedMap?.selected_map === 'usa') {
      mapThumbnail = (
        <UsSVG
          groups={relatedMap.groups || []}
          mapTitleValue={mapTitle}
          ocean_color={relatedMap.ocean_color}
          unassigned_color={relatedMap.unassigned_color}
          data={relatedMap.data}
          font_color={relatedMap.font_color}
          is_title_hidden={relatedMap.is_title_hidden}
          isThumbnail
        />
      );
    } else if (relatedMap?.selected_map === 'europe') {
      mapThumbnail = (
        <EuropeSVG
          groups={relatedMap.groups || []}
          mapTitleValue={mapTitle}
          ocean_color={relatedMap.ocean_color}
          unassigned_color={relatedMap.unassigned_color}
          data={relatedMap.data}
          font_color={relatedMap.font_color}
          is_title_hidden={relatedMap.is_title_hidden}
          isThumbnail
        />
      );
    }

    let mainText;
    let body = null;

    // Removed "like" from the feed, so no (type === 'like') case
    if (type === 'star') {
      // use star icon
      const totalStars = relatedMap?.save_count || 0;
      mainText = (
        <>
          <strong
            className={styles.userNameLink}
            onClick={(e) => handleUserClick(e, user?.username)}
          >
            {senderName}
          </strong>{' '}
         starred
          "<em>{mapTitle}</em>"
        </>
      );
      body = (
        <p className={styles.starCount}>
           <FaStar
            style={{ marginLeft: '6px', marginRight: '4px', color: 'black' }}
          /> {totalStars}
        </p>
      );
    } else if (type === 'comment') {
      const commentText = commentObj?.content || 'No comment text.';
      mainText = (
        <>
          <strong
            className={styles.userNameLink}
            onClick={(e) => handleUserClick(e, user?.username)}
          >
            {senderName}
          </strong>{' '}
          commented on "<em>{mapTitle}</em>"
        </>
      );
      body = (
        <div className={styles.commentBox}>
          <img
            className={styles.userAvatar}
            src={userAvatarUrl}
            alt="User"
            onClick={(e) => handleUserClick(e, user?.username)}
          />
          <div className={styles.commentText}>{commentText}</div>
        </div>
      );
    } else if (type === 'reply') {
      const replyText = commentObj?.content || 'No reply text.';
      const parentComment = commentObj?.ParentComment?.content || 'No parent comment.';
      mainText = (
        <>
          <strong
            className={styles.userNameLink}
            onClick={(e) => handleUserClick(e, user?.username)}
          >
            {senderName}
          </strong>{' '}
          replied to your comment on "<em>{mapTitle}</em>"
        </>
      );
      body = (
        <div className={styles.commentReplyBox}>
          <div className={styles.originalComment}>
            <strong>You:</strong> {parentComment}
          </div>
          <div className={styles.replyBox}>
            <img
              className={styles.userAvatar}
              src={userAvatarUrl}
              alt="User"
              onClick={(e) => handleUserClick(e, user?.username)}
            />
            <div className={styles.commentText}>{replyText}</div>
          </div>
        </div>
      );
    } else if (type === 'like') {
      // "X liked your comment"
      // commentObj is the comment that was liked, 
      // (and might have commentObj.ParentComment if it was a reply, etc.)
      const likedCommentText = commentObj?.content || "No comment text.";
    
      mainText = (
        <>
          <strong
            className={styles.userNameLink}
            onClick={(e) => handleUserClick(e, user?.username)}
          >
            {senderName}
          </strong>{' '}
          liked your comment on "<em>{mapTitle}</em>"
        </>
      );
      
      body = (
        <div className={styles.commentBox}>
          <img
            className={styles.userAvatar}
            src={userAvatarUrl}
            alt="User"
            onClick={(e) => handleUserClick(e, user?.username)}
          />
          <div className={styles.commentText}>{likedCommentText}</div>
        </div>
      );
    }
    
    return (
      <div
        className={styles.activityItem}
        key={notif.id}
        onClick={() => handleActivityItemClick(notif)}
      >
        <div className={styles.thumbContainer}>{mapThumbnail}</div>
        <div className={styles.activityDetails}>
          <p>{mainText}</p>
          {body}
          <span className={styles.timestamp}>
            {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div
        className={`${styles.dashboardContent} ${
          isCollapsed ? styles.contentCollapsed : ''
        }`}
      >
        <Header
          title="Dashboard"
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={() => {}}
          profile_picture={profile?.profile_picture}
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className={styles.mainWrapper}>
              {/* LEFT: Recently Modified Maps */}
              

              {/* CENTER: Stats + Activity Feed */}
              <div className={styles.centerColumn}>
                <div className={styles.statsContainer}>
                  <div className={styles.statItem}>
                    <FaMap className={styles.statIcon} />
                    <span className={styles.statLabel}>Maps Created:</span>
                    <span className={styles.statValue}>{totalMapsCreated}</span>
                  </div>
                  <div className={styles.statItem}>
                    <FaStar className={styles.statIcon} />
                    <span className={styles.statLabel}>Stars Received:</span>
                    <span className={styles.statValue}>{totalStarsReceived}</span>
                  </div>
                  <div className={styles.statItem}>
                    <FaCalendarAlt className={styles.statIcon} />
                    <span className={styles.statLabel}>Profile Age:</span>
                    <span className={styles.statValue}>{profileAgeDays} days</span>
                  </div>
                </div>

                <section className={styles.activityFeedSection}>
                  <h2>Activity Feed</h2>
                  {notifications.length === 0 ? (
                    <p>No activity yet.</p>
                  ) : (
                    <div className={styles.activityFeed}>
                      {notifications.map(renderActivityItem)}
                    </div>
                  )}
                </section>
              </div>

                  {/* Right side */}
                  <div className={styles.leftMapsSidebar}>
                <h2>Recently Modified Maps</h2>
                {recentMaps.length === 0 ? (
                  <p>No maps found.</p>
                ) : (
                  <ul className={styles.recentMapsList}>
                    {recentMaps.map((map) => (
                      <li key={map.id} className={styles.mapListItem}>
                        <div className={styles.mapActions}>
                          <button
                            className={styles.editBtn}
                            onClick={(e) => handleEdit(e, map.id)}
                          >
                            Edit
                          </button>
                        </div>
                        <span
                          className={styles.mapTitle}
                          onClick={() => handleMapClick(map.id)}
                        >
                          {map.title || 'Untitled Map'}
                        </span>
                        <div className={styles.mapModifiedDate}>
                          {map.updated_at
                            ? formatDistanceToNow(new Date(map.updated_at), {
                                addSuffix: true,
                              })
                            : 'Unknown'}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>
          </>
        )}

        {showDeleteModal && (
          <div className={styles.modalOverlay} onClick={cancelDelete}>
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Confirm Deletion</h2>
              <p>
                Are you sure you want to delete "
                <strong>{mapToDelete?.title}</strong>"?
              </p>
              <div className={styles.modalButtons}>
                <button className={styles.confirmDelete} onClick={confirmDelete}>
                  Delete
                </button>
                <button className={styles.cancelDelete} onClick={cancelDelete}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
